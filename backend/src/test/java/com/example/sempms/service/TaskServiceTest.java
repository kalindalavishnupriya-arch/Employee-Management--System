package com.example.sempms.service;

import com.example.sempms.dto.TaskDto;
import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.model.TaskEntity;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.TaskRepository;
import com.example.sempms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EmailService emailService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private TaskEntity sampleTask;
    private TaskDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleTask = TaskEntity.builder()
                .id(100L)
                .title("Implement Security Controls")
                .description("Configure Spring Security JWT Filter")
                .status("TODO")
                .progress(0)
                .dueDate(LocalDate.now().plusDays(5))
                .build();

        sampleDto = TaskDto.builder()
                .title("Implement Security Controls")
                .description("Configure Spring Security JWT Filter")
                .status("TODO")
                .progress(0)
                .build();
    }

    @Test
    void saveTask_Success() {
        when(taskRepository.save(any(TaskEntity.class))).thenReturn(sampleTask);

        TaskDto result = taskService.save(sampleDto);

        assertNotNull(result);
        assertEquals("Implement Security Controls", result.getTitle());
        assertEquals(0, result.getProgress());
        verify(auditLogService, times(1)).log(eq("CREATE"), eq("TASK"), eq(100L), any());
    }

    @Test
    void updateTask_StatusCompleted_SetsProgress100() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(i -> i.getArgument(0));

        TaskDto updateDto = TaskDto.builder()
                .status("COMPLETED")
                .build();

        TaskDto result = taskService.update(100L, updateDto, "admin", true);

        assertNotNull(result);
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(100, result.getProgress());
    }
}
