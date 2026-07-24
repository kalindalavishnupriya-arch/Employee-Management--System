package com.example.sempms.service;

import com.example.sempms.dto.AuthRequest;
import com.example.sempms.dto.AuthResponse;
import com.example.sempms.dto.UserDto;
import com.example.sempms.model.Employee;
import com.example.sempms.model.Role;
import com.example.sempms.model.User;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.UserRepository;
import com.example.sempms.security.JwtProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtProvider jwtProvider,
                       AuditLogService auditLogService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    @Transactional
    public UserDto register(String username, String password, Role role, String email, String firstName, String lastName) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        Employee linkedEmployee = null;
        if (email != null && !email.isBlank()) {
            Optional<Employee> existingEmp = employeeRepository.findByEmail(email);
            if (existingEmp.isPresent()) {
                linkedEmployee = existingEmp.get();
            } else if (firstName != null && lastName != null) {
                linkedEmployee = Employee.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .department("General")
                        .status("Active")
                        .designation(role == Role.ROLE_ADMIN ? "Administrator" : "Employee")
                        .joinedDate(LocalDate.now())
                        .build();
                linkedEmployee = employeeRepository.save(linkedEmployee);
            }
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .department(linkedEmployee != null ? linkedEmployee.getDepartment() : "General")
                .designation(linkedEmployee != null ? linkedEmployee.getDesignation() : (role == Role.ROLE_ADMIN ? "Administrator" : "Employee"))
                .joinedDate(linkedEmployee != null ? linkedEmployee.getJoinedDate() : LocalDate.now())
                .status(linkedEmployee != null ? linkedEmployee.getStatus() : "Active")
                .employee(linkedEmployee)
                .build();

        user = userRepository.save(user);

        auditLogService.log("CREATE", "USER", user.getId(),
                "Registered new user '" + username + "' with role " + role);

        if (email != null && !email.isBlank()) {
            String fullName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
            emailService.sendWelcomeEmail(email, username, fullName.trim(), role.name());
        }

        return mapToDto(user);
    }

    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtProvider.generateToken(user.getUsername(), user.getRole().name());
        Long empId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .employeeId(empId)
                .build();
    }

    public UserDto findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        Employee emp = user.getEmployee();
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .employeeId(emp != null ? emp.getId() : null)
                .firstName(user.getFirstName() != null ? user.getFirstName() : (emp != null ? emp.getFirstName() : null))
                .lastName(user.getLastName() != null ? user.getLastName() : (emp != null ? emp.getLastName() : null))
                .email(user.getEmail() != null ? user.getEmail() : (emp != null ? emp.getEmail() : null))
                .department(user.getDepartment() != null ? user.getDepartment() : (emp != null ? emp.getDepartment() : null))
                .designation(user.getDesignation() != null ? user.getDesignation() : (emp != null ? emp.getDesignation() : null))
                .joinedDate(user.getJoinedDate() != null ? user.getJoinedDate() : (emp != null ? emp.getJoinedDate() : null))
                .status(user.getStatus() != null ? user.getStatus() : (emp != null ? emp.getStatus() : null))
                .build();
    }
}
