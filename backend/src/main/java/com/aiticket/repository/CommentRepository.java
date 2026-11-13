package com.aiticket.repository;

import com.aiticket.model.Comment;
import com.aiticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
    List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
