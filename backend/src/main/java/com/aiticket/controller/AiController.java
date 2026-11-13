package com.aiticket.controller;

import com.aiticket.dto.AiSummaryResponse;
import com.aiticket.model.Ticket;
import com.aiticket.service.AiService;
import com.aiticket.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final TicketService ticketService;

    public AiController(AiService aiService, TicketService ticketService) {
        this.aiService = aiService;
        this.ticketService = ticketService;
    }

    @PostMapping("/summarize/{ticketId}")
    public ResponseEntity<AiSummaryResponse> summarizeTicket(@PathVariable Long ticketId) {
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        AiSummaryResponse summary = aiService.summarizeTicket(ticket);
        return ResponseEntity.ok(summary);
    }
}
