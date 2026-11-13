package com.aiticket.repository;

import com.aiticket.model.Ticket;
import com.aiticket.model.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketOrderByCreatedAtDesc(Ticket ticket);
    List<TicketHistory> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
