package com.example.sempms.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE

    @Column(nullable = false)
    private String entityType; // EMPLOYEE, PROJECT, TASK, USER

    private Long entityId;

    private String performedBy;

    @Column(length = 2000)
    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
