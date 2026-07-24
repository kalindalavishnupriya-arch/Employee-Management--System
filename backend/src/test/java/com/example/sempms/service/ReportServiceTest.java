package com.example.sempms.service;

import com.example.sempms.dto.ReportDto;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void buildSummaryReport_Success() {
        when(employeeRepository.count()).thenReturn(25L);
        when(projectRepository.count()).thenReturn(5L);
        when(taskRepository.count()).thenReturn(50L);
        when(taskRepository.countByStatusIgnoreCase("COMPLETED")).thenReturn(30L);
        when(taskRepository.countOverdueTasks(any(LocalDate.class))).thenReturn(4L);
        when(taskRepository.countTasksByStatus()).thenReturn(Collections.emptyList());
        when(projectRepository.countProjectsByStatus()).thenReturn(Collections.emptyList());
        when(employeeRepository.countEmployeesByDepartment()).thenReturn(Collections.emptyList());

        ReportDto report = reportService.getSummaryReport();

        assertNotNull(report);
        assertEquals(25L, report.getTotalEmployees());
        assertEquals(5L, report.getTotalProjects());
        assertEquals(50L, report.getTotalTasks());
        assertEquals(30L, report.getCompletedTasks());
        assertEquals(20L, report.getPendingTasks());
        assertEquals(4L, report.getOverdueTasks());
    }
}
