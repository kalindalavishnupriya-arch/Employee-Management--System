package com.example.sempms.service;

import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Scheduled service that checks project deadlines daily and sends:
 * - Email alerts to admins and project team members when a deadline is within 5 days
 * - Email alerts for overdue (past deadline) non-completed projects
 *
 * Runs every day at 08:00 AM server time.
 */
@Service
public class ProjectDeadlineSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ProjectDeadlineSchedulerService.class);

    private static final int DEADLINE_WARNING_DAYS = 5;

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ProjectDeadlineSchedulerService(ProjectRepository projectRepository,
                                            UserRepository userRepository,
                                            EmailService emailService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Runs every day at 08:00 AM.
     * Sends deadline warning emails for projects whose deadline is within 5 days.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendUpcomingDeadlineAlerts() {
        LocalDate today = LocalDate.now();
        LocalDate alertEnd = today.plusDays(DEADLINE_WARNING_DAYS);

        log.info("[Scheduler] Checking projects with deadlines between {} and {}", today, alertEnd);

        List<Project> upcomingProjects = projectRepository.findProjectsWithUpcomingDeadlines(today, alertEnd);

        if (upcomingProjects.isEmpty()) {
            log.info("[Scheduler] No upcoming project deadlines found.");
            return;
        }

        for (Project project : upcomingProjects) {
            log.info("[Scheduler] Project '{}' deadline: {}", project.getName(), project.getDeadline());
            notifyProjectTeam(project);
        }
    }

    /**
     * Runs every day at 08:30 AM.
     * Sends overdue alerts for projects whose deadline has already passed.
     */
    @Scheduled(cron = "0 30 8 * * *")
    public void sendOverdueProjectAlerts() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        // Look back up to 7 days to avoid too much spam
        LocalDate lookBackFrom = LocalDate.now().minusDays(7);

        log.info("[Scheduler] Checking overdue projects (deadline {} to {})", lookBackFrom, yesterday);

        List<Project> overdueProjects = projectRepository.findProjectsWithUpcomingDeadlines(lookBackFrom, yesterday);

        if (overdueProjects.isEmpty()) {
            log.info("[Scheduler] No overdue projects found.");
            return;
        }

        for (Project project : overdueProjects) {
            log.warn("[Scheduler] OVERDUE Project '{}', deadline was: {}", project.getName(), project.getDeadline());
            notifyProjectTeam(project);
        }
    }

    /**
     * Notify all team members AND admin users assigned to a project about the deadline.
     */
    private void notifyProjectTeam(Project project) {
        Set<Employee> teamMembers = project.getEmployees();
        String deadlineStr = project.getDeadline() != null ? project.getDeadline().toString() : "N/A";
        String statusStr = project.getStatus() != null ? project.getStatus() : "UNKNOWN";

        if (teamMembers == null || teamMembers.isEmpty()) {
            log.info("[Scheduler] Project '{}' has no team members — skipping email notifications.", project.getName());
        } else {
            for (Employee emp : teamMembers) {
                if (emp.getEmail() != null && !emp.getEmail().isBlank()) {
                    String fullName = (emp.getFirstName() != null ? emp.getFirstName() : "") +
                                     " " + (emp.getLastName() != null ? emp.getLastName() : "");
                    emailService.sendProjectDeadlineWarningEmail(
                            emp.getEmail(),
                            fullName.trim(),
                            project.getName(),
                            deadlineStr,
                            statusStr
                    );
                    log.info("[Scheduler] Sent deadline alert to team member: {}", emp.getEmail());
                }
            }
        }

        // Also notify admin users
        userRepository.findByRole(com.example.sempms.model.Role.ROLE_ADMIN).stream()
                .filter(u -> u.getEmployee() != null && u.getEmployee().getEmail() != null)
                .forEach(adminUser -> {
                    Employee adminEmp = adminUser.getEmployee();
                    String fullName = (adminEmp.getFirstName() != null ? adminEmp.getFirstName() : "") +
                                     " " + (adminEmp.getLastName() != null ? adminEmp.getLastName() : "");
                    emailService.sendProjectDeadlineWarningEmail(
                            adminEmp.getEmail(),
                            fullName.trim(),
                            project.getName(),
                            deadlineStr,
                            statusStr
                    );
                    log.info("[Scheduler] Sent deadline alert to admin: {}", adminEmp.getEmail());
                });
    }
}
