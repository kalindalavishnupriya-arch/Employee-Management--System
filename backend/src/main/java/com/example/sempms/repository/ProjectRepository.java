package com.example.sempms.repository;

import com.example.sempms.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR LOWER(p.status) = LOWER(:status)) AND " +
           "(:priority IS NULL OR :priority = '' OR LOWER(p.priority) = LOWER(:priority))")
    Page<Project> searchProjects(@Param("query") String query,
                                 @Param("status") String status,
                                 @Param("priority") String priority,
                                 Pageable pageable);

    @Query("SELECT p.status, COUNT(p) FROM Project p GROUP BY p.status")
    List<Object[]> countProjectsByStatus();

    @Query("SELECT DISTINCT p FROM Project p JOIN p.employees e WHERE e.id = :employeeId")
    List<Project> findProjectsByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.employees " +
           "WHERE p.status <> 'COMPLETED' AND p.deadline IS NOT NULL " +
           "AND p.deadline BETWEEN :from AND :to")
    List<Project> findProjectsWithUpcomingDeadlines(@Param("from") LocalDate from,
                                                     @Param("to") LocalDate to);
}

