package com.example.sempms.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {
    private long totalEmployees;
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;
    private Map<String, Long> taskStatusCounts;
    private Map<String, Long> projectStatusCounts;
    private Map<String, Long> departmentEmployeeCounts;
    private List<EmployeeTaskReport> employeeTaskReports;
    private List<ProjectProgressReport> projectProgressReports;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeeTaskReport {
        private Long employeeId;
        private String employeeName;
        private String department;
        private long totalAssigned;
        private long completed;
        private long pending;
        private double completionRatePercentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectProgressReport {
        private Long projectId;
        private String projectName;
        private String status;
        private String priority;
        private long totalTasks;
        private long completedTasks;
        private double progressPercentage;
        private String deadline;
    }
}
