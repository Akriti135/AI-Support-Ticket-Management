package com.aiticket.config;

import com.aiticket.model.*;
import com.aiticket.repository.CommentRepository;
import com.aiticket.repository.TicketHistoryRepository;
import com.aiticket.repository.TicketRepository;
import com.aiticket.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            TicketRepository ticketRepository,
            CommentRepository commentRepository,
            TicketHistoryRepository historyRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.historyRepository = historyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Database empty. Seeding default users and sample tickets...");

            // 1. Seed Users
            User admin = new User(null, "Admin User", "admin@aiticket.com", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN);
            User agent = new User(null, "Alex Rivera (Agent)", "agent@aiticket.com", passwordEncoder.encode("agent123"), Role.ROLE_AGENT);
            User user = new User(null, "John Doe (Client)", "user@aiticket.com", passwordEncoder.encode("user123"), Role.ROLE_USER);

            admin = userRepository.save(admin);
            agent = userRepository.save(agent);
            user = userRepository.save(user);

            // 2. Seed Sample Tickets
            Ticket ticket1 = new Ticket();
            ticket1.setTitle("Database connection timeout during peak traffic");
            ticket1.setDescription("Production API servers are experiencing intermittent JDBC connection pool timeouts during morning peak hours (9:00 - 10:30 AM). Need connection pool sizing and read replica tuning.");
            ticket1.setCategory(Category.TECHNICAL);
            ticket1.setPriority(Priority.HIGH);
            ticket1.setStatus(Status.IN_PROGRESS);
            ticket1.setCreatedBy(user);
            ticket1.setAssignedTo(agent);
            ticket1 = ticketRepository.save(ticket1);

            historyRepository.save(new TicketHistory(ticket1, user, "TICKET_CREATED", null, "Created ticket with status OPEN"));
            historyRepository.save(new TicketHistory(ticket1, admin, "AGENT_ASSIGNED", "Unassigned", agent.getName()));
            historyRepository.save(new TicketHistory(ticket1, agent, "STATUS_CHANGED", "OPEN", "IN_PROGRESS"));

            commentRepository.save(new Comment(ticket1, user, "This is blocking several customer checkouts today. Please prioritize!"));
            commentRepository.save(new Comment(ticket1, agent, "Investigating connection leak in reporting queries. Setting max lifetime parameter now."));

            Ticket ticket2 = new Ticket();
            ticket2.setTitle("Duplicate charge on monthly enterprise subscription");
            ticket2.setDescription("Client invoice #INV-9281 was billed twice on November 1st. Please issue a refund or credit note for the secondary transaction.");
            ticket2.setCategory(Category.BILLING);
            ticket2.setPriority(Priority.MEDIUM);
            ticket2.setStatus(Status.OPEN);
            ticket2.setCreatedBy(user);
            ticket2 = ticketRepository.save(ticket2);

            historyRepository.save(new TicketHistory(ticket2, user, "TICKET_CREATED", null, "Created ticket with status OPEN"));
            commentRepository.save(new Comment(ticket2, user, "Attached bank statement showing both debit entries."));

            Ticket ticket3 = new Ticket();
            ticket3.setTitle("Request for SSO integration documentation and SAML 2.0 metadata");
            ticket3.setDescription("We would like to configure Okta SSO for our organization. Could you share the application callback URLs and certificate thumbprints?");
            ticket3.setCategory(Category.GENERAL);
            ticket3.setPriority(Priority.LOW);
            ticket3.setStatus(Status.RESOLVED);
            ticket3.setCreatedBy(user);
            ticket3.setAssignedTo(agent);
            ticket3 = ticketRepository.save(ticket3);

            historyRepository.save(new TicketHistory(ticket3, user, "TICKET_CREATED", null, "Created ticket with status OPEN"));
            historyRepository.save(new TicketHistory(ticket3, agent, "AGENT_ASSIGNED", "Unassigned", agent.getName()));
            historyRepository.save(new TicketHistory(ticket3, agent, "STATUS_CHANGED", "IN_PROGRESS", "RESOLVED"));

            commentRepository.save(new Comment(ticket3, agent, "Documentation sent to the client via secure portal. Metadata URL: https://sso.aiticket.com/saml/metadata.xml"));

            logger.info("Sample demo data seeded successfully!");
        }
    }
}
