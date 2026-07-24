package com.example.sempms.service;

import com.example.sempms.dto.EmployeeDto;
import com.example.sempms.model.Employee;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public EmployeeService(EmployeeRepository employeeRepository,
                           UserRepository userRepository,
                           AuditLogService auditLogService,
                           EmailService emailService) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    @Transactional
    public EmployeeDto save(EmployeeDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("An employee with email '" + dto.getEmail() + "' already exists");
        }
        Employee employee = toEntity(dto);
        if (employee.getJoinedDate() == null) {
            employee.setJoinedDate(LocalDate.now());
        }
        if (employee.getStatus() == null || employee.getStatus().isBlank()) {
            employee.setStatus("Active");
        }
        Employee saved = employeeRepository.save(employee);
        auditLogService.log("CREATE", "EMPLOYEE", saved.getId(),
                "Created employee: " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getEmail() + ")");
        return toDto(saved);
    }

    @Transactional
    public EmployeeDto update(Long id, EmployeeDto dto, String callerUsername, boolean isAdmin) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        if (!isAdmin) {
            var callerUser = userRepository.findByUsername(callerUsername).orElse(null);
            if (callerUser == null || callerUser.getEmployee() == null || !callerUser.getEmployee().getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Access denied: You can only update your own profile.");
            }
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!employee.getEmail().equalsIgnoreCase(dto.getEmail()) && employeeRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("An employee with email '" + dto.getEmail() + "' already exists");
            }
            employee.setEmail(dto.getEmail());
        }

        if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) {
            employee.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null && !dto.getLastName().isBlank()) {
            employee.setLastName(dto.getLastName());
        }

        if (isAdmin) {
            if (dto.getDepartment() != null && !dto.getDepartment().isBlank()) {
                employee.setDepartment(dto.getDepartment());
            }
            if (dto.getDesignation() != null) {
                employee.setDesignation(dto.getDesignation());
            }
            if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
                employee.setStatus(dto.getStatus());
            }
            if (dto.getJoinedDate() != null) {
                employee.setJoinedDate(dto.getJoinedDate());
            }
        }

        Employee updated = employeeRepository.save(employee);
        
        if (updated.getUser() != null) {
            var user = updated.getUser();
            user.setFirstName(updated.getFirstName());
            user.setLastName(updated.getLastName());
            user.setEmail(updated.getEmail());
            user.setDepartment(updated.getDepartment());
            user.setDesignation(updated.getDesignation());
            user.setStatus(updated.getStatus());
            user.setJoinedDate(updated.getJoinedDate());
            userRepository.save(user);
        }

        auditLogService.log("UPDATE", "EMPLOYEE", updated.getId(),
                "Updated employee details for: " + updated.getFirstName() + " " + updated.getLastName());
        
        if (updated.getEmail() != null) {
            emailService.sendProfileUpdatedEmail(updated.getEmail(), updated.getFirstName() + " " + updated.getLastName());
        }
        return toDto(updated);
    }

    @Transactional
    public EmployeeDto updateProfileImage(Long id, String filename, String callerUsername, boolean isAdmin) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        if (!isAdmin && callerUsername != null) {
            var callerUser = userRepository.findByUsername(callerUsername).orElse(null);
            if (callerUser == null || callerUser.getEmployee() == null || !callerUser.getEmployee().getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Access denied: You can only upload a profile picture for your own profile.");
            }
        }

        employee.setProfileImagePath(filename);
        Employee updated = employeeRepository.save(employee);
        auditLogService.log("UPDATE", "EMPLOYEE", updated.getId(),
                "Updated profile image for employee: " + updated.getFirstName() + " " + updated.getLastName());

        if (updated.getEmail() != null) {
            emailService.sendProfileUpdatedEmail(updated.getEmail(), updated.getFirstName() + " " + updated.getLastName());
        }
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
        employeeRepository.deleteById(id);
        auditLogService.log("DELETE", "EMPLOYEE", id,
                "Deleted employee: " + employee.getFirstName() + " " + employee.getLastName());
    }

    public Page<EmployeeDto> search(String query, String department, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return employeeRepository.searchEmployees(query, department, status, pageable).map(this::toDto);
    }

    public EmployeeDto findById(Long id) {
        return employeeRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
    }

    public EmployeeDto toDto(Employee employee) {
        Long userId = null;
        if (employee.getUser() != null) {
            userId = employee.getUser().getId();
        } else {
            var userOpt = userRepository.findByEmployeeId(employee.getId());
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            }
        }
        String profileImageUrl = null;
        if (employee.getProfileImagePath() != null && !employee.getProfileImagePath().isBlank()) {
            profileImageUrl = "/api/files/profile/" + employee.getProfileImagePath();
        }

        return EmployeeDto.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .status(employee.getStatus())
                .designation(employee.getDesignation())
                .joinedDate(employee.getJoinedDate())
                .userId(userId)
                .profileImageUrl(profileImageUrl)
                .build();
    }

    private Employee toEntity(EmployeeDto dto) {
        return Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .status(dto.getStatus())
                .joinedDate(dto.getJoinedDate())
                .build();
    }
}
