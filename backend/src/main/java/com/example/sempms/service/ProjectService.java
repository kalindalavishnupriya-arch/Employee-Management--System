package com.example.sempms.service;

import com.example.sempms.dto.ProjectDto;
import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          EmployeeRepository employeeRepository,
                          AuditLogService auditLogService,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectDto save(ProjectDto dto) {
        Project project = toEntity(dto);
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus("PLANNED");
        }
        if (project.getPriority() == null || project.getPriority().isBlank()) {
            project.setPriority("MEDIUM");
        }
        Project saved = projectRepository.save(project);
        auditLogService.log("CREATE", "PROJECT", saved.getId(),
                "Created project: " + saved.getName() + " [Status: " + saved.getStatus() + "]");
        return toDto(saved);
    }

    @Transactional
    public ProjectDto update(Long id, ProjectDto dto, String callerUsername, boolean isAdmin) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        // If caller is an EMPLOYEE, verify they belong to the project team
        if (!isAdmin) {
            boolean isMember = userRepository.findByUsername(callerUsername)
                    .map(u -> u.getEmployee())
                    .map(emp -> project.getEmployees().stream()
                            .anyMatch(e -> e.getId().equals(emp.getId())))
                    .orElse(false);
            if (!isMember) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Access denied: you are not a member of this project's team.");
            }
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            project.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            project.setStatus(dto.getStatus());
        }
        if (dto.getPriority() != null && !dto.getPriority().isBlank()) {
            project.setPriority(dto.getPriority());
        }
        if (dto.getDeadline() != null) {
            project.setDeadline(dto.getDeadline());
        }
        if (dto.getEmployeeIds() != null) {
            project.setEmployees(resolveEmployees(dto.getEmployeeIds()));
        }

        Project updated = projectRepository.save(project);
        auditLogService.log("UPDATE", "PROJECT", updated.getId(),
                "Updated project details: " + updated.getName());
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
        projectRepository.deleteById(id);
        auditLogService.log("DELETE", "PROJECT", id,
                "Deleted project: " + project.getName());
    }

    public Page<ProjectDto> search(String query, String status, String priority, int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return projectRepository.searchProjects(query, status, priority, pageable).map(this::toDto);
    }

    public ProjectDto findById(Long id) {
        return projectRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
    }

    public ProjectDto toDto(Project project) {
        Set<Long> employeeIds = project.getEmployees().stream()
                .map(Employee::getId)
                .collect(Collectors.toSet());

        List<String> employeeNames = project.getEmployees().stream()
                .map(e -> e.getFirstName() + " " + e.getLastName())
                .collect(Collectors.toList());

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .priority(project.getPriority())
                .deadline(project.getDeadline())
                .employeeIds(employeeIds)
                .employeeNames(employeeNames)
                .build();
    }

    private Project toEntity(ProjectDto dto) {
        return Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .deadline(dto.getDeadline())
                .employees(resolveEmployees(dto.getEmployeeIds()))
                .build();
    }

    private Set<Employee> resolveEmployees(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(employeeRepository.findAllById(ids));
    }
}
