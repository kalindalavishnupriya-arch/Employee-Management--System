package com.example.sempms.service;

import com.example.sempms.dto.ProjectDto;
import com.example.sempms.model.Project;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ProjectService projectService;

    private Project sampleProject;
    private ProjectDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleProject = Project.builder()
                .id(10L)
                .name("Smart System Redesign")
                .description("Upgrade architecture to Spring Boot & React")
                .status("PLANNED")
                .priority("HIGH")
                .deadline(LocalDate.now().plusMonths(2))
                .employees(new HashSet<>())
                .build();

        sampleDto = ProjectDto.builder()
                .name("Smart System Redesign")
                .description("Upgrade architecture to Spring Boot & React")
                .status("PLANNED")
                .priority("HIGH")
                .build();
    }

    @Test
    void saveProject_Success() {
        when(projectRepository.save(any(Project.class))).thenReturn(sampleProject);

        ProjectDto result = projectService.save(sampleDto);

        assertNotNull(result);
        assertEquals("Smart System Redesign", result.getName());
        assertEquals("PLANNED", result.getStatus());
        verify(auditLogService, times(1)).log(eq("CREATE"), eq("PROJECT"), eq(10L), any());
    }

    @Test
    void findById_Success() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));

        ProjectDto result = projectService.findById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("HIGH", result.getPriority());
    }

    @Test
    void delete_Success() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(sampleProject));
        doNothing().when(projectRepository).deleteById(10L);

        assertDoesNotThrow(() -> projectService.delete(10L));
        verify(projectRepository, times(1)).deleteById(10L);
    }
}
