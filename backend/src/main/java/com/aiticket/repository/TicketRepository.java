package com.aiticket.repository;

import com.aiticket.model.Category;
import com.aiticket.model.Priority;
import com.aiticket.model.Status;
import com.aiticket.model.Ticket;
import com.aiticket.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    List<Ticket> findAllByOrderByCreatedAtDesc();

    long countByStatus(Status status);

    long countByCategory(Category category);

    long countByPriority(Priority priority);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:userId IS NULL OR t.createdBy.id = :userId) AND " +
           "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "  OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> searchTickets(
            @Param("status") Status status,
            @Param("category") Category category,
            @Param("priority") Priority priority,
            @Param("userId") Long userId,
            @Param("assignedToId") Long assignedToId,
            @Param("keyword") String keyword
    );
}
