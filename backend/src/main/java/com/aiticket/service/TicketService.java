package com.aiticket.service;

import com.aiticket.dto.CommentRequest;
import com.aiticket.dto.DashboardStatsResponse;
import com.aiticket.dto.TicketRequest;
import com.aiticket.dto.TicketResponse;
import com.aiticket.exception.BadRequestException;
import com.aiticket.exception.ResourceNotFoundException;
import com.aiticket.model.*;
import com.aiticket.repository.CommentRepository;
import com.aiticket.repository.TicketHistoryRepository;
import com.aiticket.repository.TicketRepository;
import com.aiticket.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            CommentRepository commentRepository,
            TicketHistoryRepository historyRepository,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TicketResponse createTicket(TicketRequest req, User currentUser) {
        Ticket ticket = new Ticket();
        ticket.setTitle(req.getTitle().trim());
        ticket.setDescription(req.getDescription().trim());
        ticket.setCategory(req.getCategory() != null ? req.getCategory() : Category.GENERAL);
        ticket.setPriority(req.getPriority() != null ? req.getPriority() : Priority.MEDIUM);
        ticket.setStatus(Status.OPEN);
        ticket.setCreatedBy(currentUser);

        Ticket saved = ticketRepository.save(ticket);

        // Record history
        recordHistory(saved, currentUser, "TICKET_CREATED", null, "Created ticket with status OPEN");

        return TicketResponse.fromEntity(saved);
    }

    public Ticket getTicketEntity(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public TicketResponse getTicketById(Long id, User currentUser) {
        Ticket ticket = getTicketEntity(id);

        // User can only view their own tickets, unless AGENT or ADMIN
        if (currentUser.getRole() == Role.ROLE_USER && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this ticket");
        }

        return TicketResponse.fromEntity(ticket);
    }

    public List<TicketResponse> getTickets(
            Status status,
            Category category,
            Priority priority,
            String keyword,
            User currentUser
    ) {
        Long filterUserId = null;
        if (currentUser.getRole() == Role.ROLE_USER) {
            filterUserId = currentUser.getId();
        }

        String searchKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        List<Ticket> tickets = ticketRepository.searchTickets(
                status, category, priority, filterUserId, null, searchKeyword
        );

        return tickets.stream().map(TicketResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketRequest req, User currentUser) {
        Ticket ticket = getTicketEntity(id);

        boolean isOwner = ticket.getCreatedBy().getId().equals(currentUser.getId());
        boolean isStaff = currentUser.getRole() == Role.ROLE_AGENT || currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("You do not have permission to update this ticket");
        }

        if (req.getTitle() != null && !req.getTitle().trim().equals(ticket.getTitle())) {
            recordHistory(ticket, currentUser, "TITLE_UPDATED", ticket.getTitle(), req.getTitle().trim());
            ticket.setTitle(req.getTitle().trim());
        }

        if (req.getDescription() != null && !req.getDescription().trim().equals(ticket.getDescription())) {
            recordHistory(ticket, currentUser, "DESCRIPTION_UPDATED", ticket.getDescription(), req.getDescription().trim());
            ticket.setDescription(req.getDescription().trim());
        }

        if (req.getCategory() != null && req.getCategory() != ticket.getCategory()) {
            recordHistory(ticket, currentUser, "CATEGORY_CHANGED", ticket.getCategory().name(), req.getCategory().name());
            ticket.setCategory(req.getCategory());
        }

        if (req.getPriority() != null && req.getPriority() != ticket.getPriority()) {
            recordHistory(ticket, currentUser, "PRIORITY_CHANGED", ticket.getPriority().name(), req.getPriority().name());
            ticket.setPriority(req.getPriority());
        }

        if (req.getStatus() != null && req.getStatus() != ticket.getStatus()) {
            recordHistory(ticket, currentUser, "STATUS_CHANGED", ticket.getStatus().name(), req.getStatus().name());
            ticket.setStatus(req.getStatus());
        }

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, Status newStatus, User currentUser) {
        Ticket ticket = getTicketEntity(id);

        if (ticket.getStatus() != newStatus) {
            recordHistory(ticket, currentUser, "STATUS_CHANGED", ticket.getStatus().name(), newStatus.name());
            ticket.setStatus(newStatus);
            ticket = ticketRepository.save(ticket);
        }

        return TicketResponse.fromEntity(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, Long agentId, User currentUser) {
        if (currentUser.getRole() != Role.ROLE_AGENT && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only Agents and Admins can assign tickets");
        }

        Ticket ticket = getTicketEntity(ticketId);
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

        if (agent.getRole() != Role.ROLE_AGENT && agent.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("Assigned user must have AGENT or ADMIN role");
        }

        String oldAgentName = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : "Unassigned";
        ticket.setAssignedTo(agent);

        if (ticket.getStatus() == Status.OPEN) {
            ticket.setStatus(Status.IN_PROGRESS);
            recordHistory(ticket, currentUser, "STATUS_CHANGED", Status.OPEN.name(), Status.IN_PROGRESS.name());
        }

        recordHistory(ticket, currentUser, "AGENT_ASSIGNED", oldAgentName, agent.getName());

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteTicket(Long id, User currentUser) {
        Ticket ticket = getTicketEntity(id);

        boolean isOwner = ticket.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the ticket creator or an Admin can delete this ticket");
        }

        ticketRepository.delete(ticket);
    }

    @Transactional
    public Comment addComment(Long ticketId, CommentRequest req, User currentUser) {
        Ticket ticket = getTicketEntity(ticketId);

        // Permissions check
        if (currentUser.getRole() == Role.ROLE_USER && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You cannot comment on this ticket");
        }

        Comment comment = new Comment(ticket, currentUser, req.getCommentText().trim());
        Comment saved = commentRepository.save(comment);

        String snippet = req.getCommentText().trim();
        if (snippet.length() > 50) {
            snippet = snippet.substring(0, 50) + "...";
        }
        recordHistory(ticket, currentUser, "COMMENT_ADDED", null, snippet);

        return saved;
    }

    public List<Comment> getComments(Long ticketId, User currentUser) {
        Ticket ticket = getTicketEntity(ticketId);
        if (currentUser.getRole() == Role.ROLE_USER && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You cannot view comments for this ticket");
        }
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }

    public List<TicketHistory> getHistory(Long ticketId, User currentUser) {
        Ticket ticket = getTicketEntity(ticketId);
        if (currentUser.getRole() == Role.ROLE_USER && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You cannot view history for this ticket");
        }
        return historyRepository.findByTicketOrderByCreatedAtDesc(ticket);
    }

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalTickets(ticketRepository.count());
        stats.setOpenTickets(ticketRepository.countByStatus(Status.OPEN));
        stats.setInProgressTickets(ticketRepository.countByStatus(Status.IN_PROGRESS));
        stats.setResolvedTickets(ticketRepository.countByStatus(Status.RESOLVED));
        stats.setClosedTickets(ticketRepository.countByStatus(Status.CLOSED));

        Map<String, Long> byCategory = new HashMap<>();
        byCategory.put("TECHNICAL", ticketRepository.countByCategory(Category.TECHNICAL));
        byCategory.put("BILLING", ticketRepository.countByCategory(Category.BILLING));
        byCategory.put("GENERAL", ticketRepository.countByCategory(Category.GENERAL));
        stats.setByCategory(byCategory);

        Map<String, Long> byPriority = new HashMap<>();
        byPriority.put("HIGH", ticketRepository.countByPriority(Priority.HIGH));
        byPriority.put("MEDIUM", ticketRepository.countByPriority(Priority.MEDIUM));
        byPriority.put("LOW", ticketRepository.countByPriority(Priority.LOW));
        stats.setByPriority(byPriority);

        stats.setTotalUsers(userRepository.count());
        stats.setTotalAgents(userRepository.countByRole(Role.ROLE_AGENT));
        stats.setTotalAdmins(userRepository.countByRole(Role.ROLE_ADMIN));

        return stats;
    }

    private void recordHistory(Ticket ticket, User changedBy, String action, String oldValue, String newValue) {
        TicketHistory history = new TicketHistory(ticket, changedBy, action, oldValue, newValue);
        historyRepository.save(history);
    }
}
