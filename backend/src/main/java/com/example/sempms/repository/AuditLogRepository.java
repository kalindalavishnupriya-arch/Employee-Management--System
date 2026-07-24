package com.example.sempms.repository;

import com.example.sempms.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:query IS NULL OR LOWER(a.details) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:entityType IS NULL OR :entityType = '' OR LOWER(a.entityType) = LOWER(:entityType)) AND " +
           "(:action IS NULL OR :action = '' OR LOWER(a.action) = LOWER(:action))")
    Page<AuditLog> searchLogs(@Param("query") String query,
                             @Param("entityType") String entityType,
                             @Param("action") String action,
                             Pageable pageable);
}
