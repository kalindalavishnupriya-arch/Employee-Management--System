package com.example.sempms.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String role;
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
    private LocalDate joinedDate;
    private String status;
}
