package com.example.sempms.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private Long id;

    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 150, message = "Task title must be between 3 and 150 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Pattern(
        regexp = "^(TODO|IN_PROGRESS|COMPLETED|ON_HOLD|CANCELLED)?$",
        message = "Status must be one of: TODO, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED"
    )
    private String status;

    @Min(value = 0, message = "Progress cannot be negative")
    @Max(value = 100, message = "Progress cannot exceed 100%")
    private Integer progress;

    @Size(max = 500, message = "Remarks must not exceed 500 characters")
    private String remarks;

    private LocalDate dueDate;

    private Long assignedEmployeeId;
    private String assignedEmployeeName;

    private Long projectId;
    private String projectName;
}
