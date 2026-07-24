package com.example.sempms.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private Long id;

    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 120, message = "Project name must be between 3 and 120 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Pattern(
        regexp = "^(PLANNED|IN_PROGRESS|COMPLETED|ON_HOLD)$",
        message = "Status must be one of: PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD"
    )
    private String status;

    @Pattern(
        regexp = "^(LOW|MEDIUM|HIGH|URGENT)$",
        message = "Priority must be one of: LOW, MEDIUM, HIGH, URGENT"
    )
    private String priority;

    private LocalDate deadline;
    private Set<Long> employeeIds;
    private List<String> employeeNames;
}
