package com.example.sempms.service;

import com.example.sempms.dto.TaskDto;
import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.model.TaskEntity;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.TaskRepository;
import com.example.sempms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       EmployeeRepository employeeRepository,
                       ProjectRepository projectRepository,
                       AuditLogService auditLogService,
                       EmailService emailService,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @Transactional
    public TaskDto save(TaskDto dto) {
        TaskEntity task = toEntity(dto);
        if (task.getStatus() == null || task.getStatus().isBlank()) {
            task.setStatus("TODO");
        }
        if (task.getProgress() == null) {
            task.setProgress(0);
        }
        TaskEntity saved = taskRepository.save(task);

        auditLogService.log("CREATE", "TASK", saved.getId(),
                "Created task: '" + saved.getTitle() + "' [Status: " + saved.getStatus() + "]");

        if (saved.getProject() != null) {
            updateProjectStatusFromTasks(saved.getProject().getId());
        }

        if (saved.getAssignedEmployee() != null && saved.getAssignedEmployee().getEmail() != null) {
            emailService.sendTaskAssignmentEmail(
                    saved.getAssignedEmployee().getEmail(),
                    saved.getAssignedEmployee().getFirstName() + " " + saved.getAssignedEmployee().getLastName(),
                    saved.getTitle(),
                    saved.getProject() != null ? saved.getProject().getName() : "Unassigned",
                    saved.getDueDate() != null ? saved.getDueDate().toString() : "N/A"
            );
        }

        return toDto(saved);
    }

    @Transactional
    public TaskDto update(Long id, TaskDto dto, String callerUsername, boolean isAdmin) {
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));

        // If caller is an EMPLOYEE, verify they are either the assigned employee
        // or a member of the task's project team
        if (!isAdmin) {
            Employee callerEmployee = userRepository.findByUsername(callerUsername)
                    .map(u -> u.getEmployee())
                    .orElse(null);

            boolean isAssigned = callerEmployee != null &&
                    task.getAssignedEmployee() != null &&
                    task.getAssignedEmployee().getId().equals(callerEmployee.getId());

            boolean isProjectMember = callerEmployee != null &&
                    task.getProject() != null &&
                    task.getProject().getEmployees().stream()
                            .anyMatch(e -> e.getId().equals(callerEmployee.getId()));

            if (!isAssigned && !isProjectMember) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Access denied: you are not assigned to this task or a member of its project.");
            }
        }
        Long oldEmployeeId = task.getAssignedEmployee() != null ? task.getAssignedEmployee().getId() : null;
        Long oldProjectId = task.getProject() != null ? task.getProject().getId() : null;

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            task.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            task.setStatus(dto.getStatus());
            if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) {
                task.setProgress(100);
            }
        }
        if (dto.getProgress() != null) {
            task.setProgress(dto.getProgress());
            if (dto.getProgress() == 100 && (task.getStatus() == null || !"COMPLETED".equalsIgnoreCase(task.getStatus()))) {
                task.setStatus("COMPLETED");
            }
        }
        if (dto.getRemarks() != null) {
            task.setRemarks(dto.getRemarks());
        }
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }

        if (dto.getAssignedEmployeeId() != null) {
            if (dto.getAssignedEmployeeId() > 0) {
                Employee emp = employeeRepository.findById(dto.getAssignedEmployeeId())
                        .orElseThrow(() -> new IllegalArgumentException("Assigned employee not found with id: " + dto.getAssignedEmployeeId()));
                task.setAssignedEmployee(emp);
            } else {
                task.setAssignedEmployee(null);
            }
        }

        if (dto.getProjectId() != null) {
            if (dto.getProjectId() > 0) {
                Project proj = projectRepository.findById(dto.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + dto.getProjectId()));
                task.setProject(proj);
            } else {
                task.setProject(null);
            }
        }

        TaskEntity updated = taskRepository.save(task);

        auditLogService.log("UPDATE", "TASK", updated.getId(),
                "Updated task: '" + updated.getTitle() + "' [Progress: " + updated.getProgress() + "%]");

        Long newProjectId = updated.getProject() != null ? updated.getProject().getId() : null;
        if (oldProjectId != null && !oldProjectId.equals(newProjectId)) {
            updateProjectStatusFromTasks(oldProjectId);
        }
        if (newProjectId != null) {
            updateProjectStatusFromTasks(newProjectId);
        }

        if (updated.getAssignedEmployee() != null &&
            updated.getAssignedEmployee().getEmail() != null &&
            !updated.getAssignedEmployee().getId().equals(oldEmployeeId)) {
            emailService.sendTaskAssignmentEmail(
                    updated.getAssignedEmployee().getEmail(),
                    updated.getAssignedEmployee().getFirstName() + " " + updated.getAssignedEmployee().getLastName(),
                    updated.getTitle(),
                    updated.getProject() != null ? updated.getProject().getName() : "Unassigned",
                    updated.getDueDate() != null ? updated.getDueDate().toString() : "N/A"
            );
        }

        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        TaskEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));
        Long projectId = task.getProject() != null ? task.getProject().getId() : null;
        taskRepository.deleteById(id);
        auditLogService.log("DELETE", "TASK", id, "Deleted task: '" + task.getTitle() + "'");
        if (projectId != null) {
            updateProjectStatusFromTasks(projectId);
        }
    }

    private void updateProjectStatusFromTasks(Long projectId) {
        if (projectId == null) return;
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return;

        java.util.List<TaskEntity> tasks = taskRepository.findByProjectId(projectId);
        if (tasks.isEmpty()) return;

        boolean allCompleted = tasks.stream().allMatch(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()));
        boolean allTodo = tasks.stream().allMatch(t -> "TODO".equalsIgnoreCase(t.getStatus()) || t.getStatus() == null || t.getStatus().isBlank());

        String newStatus;
        if (allCompleted) {
            newStatus = "COMPLETED";
        } else if (allTodo) {
            newStatus = "PLANNED";
        } else {
            newStatus = "IN_PROGRESS";
        }

        if (!newStatus.equalsIgnoreCase(project.getStatus())) {
            project.setStatus(newStatus);
            projectRepository.save(project);
            auditLogService.log("AUTO_UPDATE", "PROJECT", project.getId(),
                    "Auto-updated project '" + project.getName() + "' status to " + newStatus + " based on task updates");
        }
    }

    public Page<TaskDto> search(String query, String status, Long employeeId, Long projectId, int page, int size, String sortBy, String sortDir) {
        Sort sort = "desc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return taskRepository.searchTasks(query, status, employeeId, projectId, pageable).map(this::toDto);
    }

    public TaskDto findById(Long id) {
        return taskRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + id));
    }

    public TaskDto toDto(TaskEntity task) {
        String empName = task.getAssignedEmployee() != null ?
                task.getAssignedEmployee().getFirstName() + " " + task.getAssignedEmployee().getLastName() : null;

        String projName = task.getProject() != null ? task.getProject().getName() : null;

        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .progress(task.getProgress())
                .remarks(task.getRemarks())
                .dueDate(task.getDueDate())
                .assignedEmployeeId(task.getAssignedEmployee() != null ? task.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(empName)
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(projName)
                .build();
    }

    private TaskEntity toEntity(TaskDto dto) {
        Employee emp = dto.getAssignedEmployeeId() != null ?
                employeeRepository.findById(dto.getAssignedEmployeeId()).orElse(null) : null;
        Project proj = dto.getProjectId() != null ?
                projectRepository.findById(dto.getProjectId()).orElse(null) : null;

        return TaskEntity.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .progress(dto.getProgress())
                .remarks(dto.getRemarks())
                .dueDate(dto.getDueDate())
                .assignedEmployee(emp)
                .project(proj)
                .build();
    }
}
