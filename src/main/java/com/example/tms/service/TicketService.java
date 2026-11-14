
package com.example.tms.service;

import com.example.tms.dto.CreateTicketRequest;
import com.example.tms.dto.TicketResponse;
import com.example.tms.entity.Ticket;
import com.example.tms.entity.User;
import com.example.tms.repository.TicketRepository;
import com.example.tms.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // Agent creates a ticket on behalf of a customer
    @Transactional
    public TicketResponse createTicket(
            CreateTicketRequest request,
            String customerEmail,
            Authentication authentication) {

        User agent = getAuthenticatedUser(authentication);

        if (!hasRole(agent, "AGENT") && !hasRole(agent, "ADMIN")) {
            throw new AccessDeniedException(
                    "Only agents and administrators can create tickets");
        }

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found"));

        if (!hasRole(customer, "CUSTOMER")) {
            throw new IllegalArgumentException(
                    "Selected user is not a customer");
        }

        Ticket ticket = new Ticket();

        ticket.setTicketNumber(
                "TKT-" + UUID.randomUUID()
                        .toString().substring(0, 8).toUpperCase()
        );

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());

        ticket.setPriority(
                request.priority() == null
                        || request.priority().isBlank()
                        ? "MEDIUM"
                        : request.priority().toUpperCase()
        );

        ticket.setStatus("OPEN");

        ticket.setCustomer(customer);
        ticket.setCreatedBy(agent);
        ticket.setAssignedAgent(agent);

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapToResponse(savedTicket);
    }

    // Retrieve one ticket with authorization
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(
            Long id,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        checkTicketAccess(ticket, user);

        return mapToResponse(ticket);
    }

    // Retrieve tickets according to the logged-in user's role
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        List<Ticket> tickets;

        if (hasRole(user, "ADMIN")) {
            tickets = ticketRepository.findAll();

        } else if (hasRole(user, "AGENT")) {
            tickets = ticketRepository.findByAssignedAgentId(user.getId());

        } else if (hasRole(user, "CUSTOMER")) {
            tickets = ticketRepository.findByCustomerId(user.getId());

        } else {
            throw new AccessDeniedException("Invalid user role");
        }

        return tickets.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieve authenticated user
    private User getAuthenticatedUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Authenticated user not found"));
    }

    // Check whether user has the specified role
    private boolean hasRole(User user, String expectedRole) {

        String actualRole = user.getRole().getName();

        if (actualRole.startsWith("ROLE_")) {
            actualRole = actualRole.substring(5);
        }

        return actualRole.equalsIgnoreCase(expectedRole);
    }

    // Check whether the user can access this ticket
    private void checkTicketAccess(Ticket ticket, User user) {

        if (hasRole(user, "ADMIN")) {
            return;
        }

        if (hasRole(user, "CUSTOMER")
                && ticket.getCustomer().getId().equals(user.getId())) {
            return;
        }

        if (hasRole(user, "AGENT")) {

            boolean assignedAgent =
                    ticket.getAssignedAgent() != null
                            && ticket.getAssignedAgent().getId().equals(user.getId());

            boolean creatingAgent =
                    ticket.getCreatedBy().getId().equals(user.getId());

            if (assignedAgent || creatingAgent) {
                return;
            }
        }

        throw new AccessDeniedException(
                "You are not authorized to access this ticket");
    }

    // Convert Ticket entity into response DTO
    private TicketResponse mapToResponse(Ticket ticket) {

        User customer = ticket.getCustomer();
        User agent = ticket.getAssignedAgent();

        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                customer.getId(),
                customer.getName(),
                agent != null ? agent.getId() : null,
                agent != null ? agent.getName() : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
