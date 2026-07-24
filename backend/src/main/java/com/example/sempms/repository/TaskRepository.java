package com.example.sempms.repository;

import com.example.sempms.model.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    @Query("SELECT t FROM TaskEntity t WHERE " +
           "(:query IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR LOWER(t.status) = LOWER(:status)) AND " +
           "(:employeeId IS NULL OR t.assignedEmployee.id = :employeeId) AND " +
           "(:projectId IS NULL OR t.project.id = :projectId)")
    Page<TaskEntity> searchTasks(@Param("query") String query,
                                 @Param("status") String status,
                                 @Param("employeeId") Long employeeId,
                                 @Param("projectId") Long projectId,
                                 Pageable pageable);

    List<TaskEntity> findByAssignedEmployeeId(Long employeeId);

    List<TaskEntity> findByProjectId(Long projectId);

    @Query("SELECT t.status, COUNT(t) FROM TaskEntity t GROUP BY t.status")
    List<Object[]> countTasksByStatus();

    long countByStatusIgnoreCase(String status);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE LOWER(t.status) != 'completed' AND t.dueDate < :today")
    long countOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM TaskEntity t WHERE LOWER(t.status) != 'completed' AND t.dueDate < :today")
    List<TaskEntity> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM TaskEntity t WHERE LOWER(t.status) != 'completed'")
    List<TaskEntity> findPendingTasks();
}
