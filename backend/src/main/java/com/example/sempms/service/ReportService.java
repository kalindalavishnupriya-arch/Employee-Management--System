package com.example.sempms.service;

import com.example.sempms.dto.ReportDto;
import com.example.sempms.model.Employee;
import com.example.sempms.model.Project;
import com.example.sempms.model.TaskEntity;
import com.example.sempms.repository.EmployeeRepository;
import com.example.sempms.repository.ProjectRepository;
import com.example.sempms.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public ReportService(EmployeeRepository employeeRepository,
                         ProjectRepository projectRepository,
                         TaskRepository taskRepository) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    public ReportDto getSummaryReport() {
        long totalEmployees = employeeRepository.count();
        long totalProjects = projectRepository.count();
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatusIgnoreCase("COMPLETED");
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = taskRepository.countOverdueTasks(LocalDate.now());

        Map<String, Long> taskStatusCounts = taskRepository.countTasksByStatus().stream()
                .collect(Collectors.toMap(
                        arr -> arr[0] != null && !arr[0].toString().isBlank() ? arr[0].toString() : "UNKNOWN",
                        arr -> (Long) arr[1],
                        Long::sum
                ));

        Map<String, Long> projectStatusCounts = projectRepository.countProjectsByStatus().stream()
                .collect(Collectors.toMap(
                        arr -> arr[0] != null && !arr[0].toString().isBlank() ? arr[0].toString() : "UNKNOWN",
                        arr -> (Long) arr[1],
                        Long::sum
                ));

        Map<String, Long> deptCounts = employeeRepository.countEmployeesByDepartment().stream()
                .collect(Collectors.toMap(
                        arr -> arr[0] != null && !arr[0].toString().isBlank() ? arr[0].toString() : "General",
                        arr -> (Long) arr[1],
                        Long::sum
                ));

        List<ReportDto.EmployeeTaskReport> empReports = getEmployeeTaskReports();
        List<ReportDto.ProjectProgressReport> projReports = getProjectProgressReports();

        return ReportDto.builder()
                .totalEmployees(totalEmployees)
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .overdueTasks(overdueTasks)
                .taskStatusCounts(taskStatusCounts)
                .projectStatusCounts(projectStatusCounts)
                .departmentEmployeeCounts(deptCounts)
                .employeeTaskReports(empReports)
                .projectProgressReports(projReports)
                .build();
    }

    public List<ReportDto.EmployeeTaskReport> getEmployeeTaskReports() {
        List<Employee> employees = employeeRepository.findAll();
        List<ReportDto.EmployeeTaskReport> reports = new ArrayList<>();

        for (Employee emp : employees) {
            List<TaskEntity> tasks = taskRepository.findByAssignedEmployeeId(emp.getId());
            long totalAssigned = tasks.size();
            long completed = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
            long pending = totalAssigned - completed;
            double rate = totalAssigned > 0 ? (completed * 100.0 / totalAssigned) : 0.0;

            reports.add(ReportDto.EmployeeTaskReport.builder()
                    .employeeId(emp.getId())
                    .employeeName(emp.getFirstName() + " " + emp.getLastName())
                    .department(emp.getDepartment())
                    .totalAssigned(totalAssigned)
                    .completed(completed)
                    .pending(pending)
                    .completionRatePercentage(Math.round(rate * 100.0) / 100.0)
                    .build());
        }
        return reports;
    }

    public List<ReportDto.ProjectProgressReport> getProjectProgressReports() {
        List<Project> projects = projectRepository.findAll();
        List<ReportDto.ProjectProgressReport> reports = new ArrayList<>();

        for (Project proj : projects) {
            List<TaskEntity> tasks = taskRepository.findByProjectId(proj.getId());
            long totalTasks = tasks.size();
            long completedTasks = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
            double progress = totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0.0;

            reports.add(ReportDto.ProjectProgressReport.builder()
                    .projectId(proj.getId())
                    .projectName(proj.getName())
                    .status(proj.getStatus())
                    .priority(proj.getPriority())
                    .totalTasks(totalTasks)
                    .completedTasks(completedTasks)
                    .progressPercentage(Math.round(progress * 100.0) / 100.0)
                    .deadline(proj.getDeadline() != null ? proj.getDeadline().toString() : "No Deadline")
                    .build());
        }
        return reports;
    }

    public byte[] exportPdfReport(String type) {
        StringBuilder sb = new StringBuilder();
        sb.append("====================================================\n");
        sb.append("      SMART MANAGEMENT SYSTEM - ").append(type.toUpperCase()).append(" REPORT\n");
        sb.append("      Generated on: ").append(LocalDate.now()).append("\n");
        sb.append("====================================================\n\n");

        if ("employee".equalsIgnoreCase(type)) {
            sb.append(String.format("%-5s %-25s %-15s %-10s %-10s %-10s\n", "ID", "EMPLOYEE NAME", "DEPARTMENT", "ASSIGNED", "COMPLETED", "RATE (%)"));
            sb.append("----------------------------------------------------------------------------------\n");
            for (ReportDto.EmployeeTaskReport r : getEmployeeTaskReports()) {
                sb.append(String.format("%-5d %-25s %-15s %-10d %-10d %-10.2f\n", r.getEmployeeId(), r.getEmployeeName(), r.getDepartment(), r.getTotalAssigned(), r.getCompleted(), r.getCompletionRatePercentage()));
            }
        } else if ("project".equalsIgnoreCase(type)) {
            sb.append(String.format("%-5s %-25s %-12s %-10s %-10s %-12s\n", "ID", "PROJECT NAME", "STATUS", "PRIORITY", "PROGRESS", "DEADLINE"));
            sb.append("----------------------------------------------------------------------------------\n");
            for (ReportDto.ProjectProgressReport r : getProjectProgressReports()) {
                sb.append(String.format("%-5d %-25s %-12s %-10s %-10.2f %-12s\n", r.getProjectId(), r.getProjectName(), r.getStatus(), r.getPriority(), r.getProgressPercentage(), r.getDeadline()));
            }
        } else {
            sb.append(String.format("%-5s %-25s %-12s %-10s %-20s %-12s\n", "ID", "TASK TITLE", "STATUS", "PROGRESS", "ASSIGNED TO", "DUE DATE"));
            sb.append("----------------------------------------------------------------------------------\n");
            for (TaskEntity t : taskRepository.findPendingTasks()) {
                String empName = t.getAssignedEmployee() != null ? t.getAssignedEmployee().getFirstName() + " " + t.getAssignedEmployee().getLastName() : "Unassigned";
                sb.append(String.format("%-5d %-25s %-12s %-10d %-20s %-12s\n", t.getId(), t.getTitle(), t.getStatus(), (t.getProgress() != null ? t.getProgress() : 0), empName, (t.getDueDate() != null ? t.getDueDate() : "N/A")));
            }
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportCsvReport(String type) {
        StringBuilder sb = new StringBuilder();
        if ("employee".equalsIgnoreCase(type)) {
            sb.append("Employee ID,Name,Department,Total Assigned,Completed Tasks,Completion Rate (%)\n");
            for (ReportDto.EmployeeTaskReport r : getEmployeeTaskReports()) {
                sb.append(r.getEmployeeId()).append(",")
                  .append("\"").append(r.getEmployeeName()).append("\",")
                  .append("\"").append(r.getDepartment()).append("\",")
                  .append(r.getTotalAssigned()).append(",")
                  .append(r.getCompleted()).append(",")
                  .append(r.getCompletionRatePercentage()).append("\n");
            }
        } else if ("project".equalsIgnoreCase(type)) {
            sb.append("Project ID,Project Name,Status,Priority,Total Tasks,Completed Tasks,Progress (%),Deadline\n");
            for (ReportDto.ProjectProgressReport r : getProjectProgressReports()) {
                sb.append(r.getProjectId()).append(",")
                  .append("\"").append(r.getProjectName()).append("\",")
                  .append("\"").append(r.getStatus()).append("\",")
                  .append("\"").append(r.getPriority()).append("\",")
                  .append(r.getTotalTasks()).append(",")
                  .append(r.getCompletedTasks()).append(",")
                  .append(r.getProgressPercentage()).append(",")
                  .append("\"").append(r.getDeadline()).append("\"\n");
            }
        } else {
            sb.append("Task ID,Title,Status,Progress (%),Assigned Employee,Project,Due Date\n");
            for (TaskEntity t : taskRepository.findPendingTasks()) {
                String empName = t.getAssignedEmployee() != null ? t.getAssignedEmployee().getFirstName() + " " + t.getAssignedEmployee().getLastName() : "Unassigned";
                String projName = t.getProject() != null ? t.getProject().getName() : "N/A";
                sb.append(t.getId()).append(",")
                  .append("\"").append(t.getTitle()).append("\",")
                  .append("\"").append(t.getStatus()).append("\",")
                  .append(t.getProgress() != null ? t.getProgress() : 0).append(",")
                  .append("\"").append(empName).append("\",")
                  .append("\"").append(projName).append("\",")
                  .append("\"").append(t.getDueDate() != null ? t.getDueDate() : "N/A").append("\"\n");
            }
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
