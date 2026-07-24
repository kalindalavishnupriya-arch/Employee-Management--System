package com.example.sempms.service;

import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.model.Role;
import com.example.sempms.model.User;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectDeadlineSchedulerServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ProjectDeadlineSchedulerService schedulerService;

    private Employee teamEmployee;
    private Employee adminEmployee;
    private User adminUser;
    private Project sampleProject;

    @BeforeEach
    void setUp() {
        teamEmployee = Employee.builder()
                .id(2L)
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@example.com")
                .build();

        adminEmployee = Employee.builder()
                .id(1L)
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .build();

        adminUser = User.builder()
                .id(1L)
                .username("admin")
                .password("secret")
                .role(Role.ROLE_ADMIN)
                .employee(adminEmployee)
                .build();

        Set<Employee> team = new HashSet<>();
        team.add(teamEmployee);

        sampleProject = Project.builder()
                .id(10L)
                .name("Smart System Redesign")
                .status("IN_PROGRESS")
                .priority("HIGH")
                .deadline(LocalDate.now().plusDays(3))
                .employees(team)
                .build();
    }

    @Test
    void sendUpcomingDeadlineAlerts_NoProjects_NoEmails() {
        when(projectRepository.findProjectsWithUpcomingDeadlines(any(), any()))
                .thenReturn(Collections.emptyList());

        schedulerService.sendUpcomingDeadlineAlerts();

        verify(emailService, never()).sendProjectDeadlineWarningEmail(any(), any(), any(), any(), any());
    }

    @Test
    void sendUpcomingDeadlineAlerts_WithProject_SendsToTeamAndAdmin() {
        when(projectRepository.findProjectsWithUpcomingDeadlines(any(), any()))
                .thenReturn(List.of(sampleProject));
        when(userRepository.findByRole(Role.ROLE_ADMIN))
                .thenReturn(List.of(adminUser));

        schedulerService.sendUpcomingDeadlineAlerts();

        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService, times(2)).sendProjectDeadlineWarningEmail(
                emailCaptor.capture(), any(), eq("Smart System Redesign"), any(), eq("IN_PROGRESS")
        );

        List<String> sentEmails = emailCaptor.getAllValues();
        assertTrue(sentEmails.contains("alice@example.com"), "Team member should receive email");
        assertTrue(sentEmails.contains("admin@example.com"), "Admin should receive email");
    }

    @Test
    void sendUpcomingDeadlineAlerts_NoTeamMembers_OnlyAdminNotified() {
        sampleProject.getEmployees().clear();

        when(projectRepository.findProjectsWithUpcomingDeadlines(any(), any()))
                .thenReturn(List.of(sampleProject));
        when(userRepository.findByRole(Role.ROLE_ADMIN))
                .thenReturn(List.of(adminUser));

        schedulerService.sendUpcomingDeadlineAlerts();

        // Only admin should be notified
        verify(emailService, times(1)).sendProjectDeadlineWarningEmail(
                eq("admin@example.com"), any(), any(), any(), any()
        );
    }

    @Test
    void sendOverdueProjectAlerts_WithOverdueProject_SendsAlerts() {
        Project overdueProject = Project.builder()
                .id(11L)
                .name("Old System Migration")
                .status("IN_PROGRESS")
                .priority("MEDIUM")
                .deadline(LocalDate.now().minusDays(2))
                .employees(new HashSet<>(Set.of(teamEmployee)))
                .build();

        when(projectRepository.findProjectsWithUpcomingDeadlines(any(), any()))
                .thenReturn(List.of(overdueProject));
        when(userRepository.findByRole(Role.ROLE_ADMIN))
                .thenReturn(List.of(adminUser));

        schedulerService.sendOverdueProjectAlerts();

        verify(emailService, atLeastOnce()).sendProjectDeadlineWarningEmail(any(), any(), eq("Old System Migration"), any(), any());
    }
}
