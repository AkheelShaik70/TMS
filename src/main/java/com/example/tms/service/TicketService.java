
package com.example.tms.service;

import com.example.tms.dto.CreateTicketRequest;
import com.example.tms.dto.TicketResponse;
import com.example.tms.dto.UpdateTicketRequest;
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

    // Agent or Admin creates a ticket on behalf of a customer
    @Transactional
    public TicketResponse createTicket(
            CreateTicketRequest request,
            String customerEmail,
            Authentication authentication) {

        User agent = getAuthenticatedUser(authentication);

        if (!hasRole(agent, "AGENT") && !hasRole(agent, "ADMIN")) {
            throw new AccessDeniedException(
                    "Only agents and admins can create tickets for customers");
        }

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"));

        if (!hasRole(customer, "CUSTOMER")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The specified user is not a customer");
        }

        Ticket ticket = new Ticket();

        ticket.setTicketNumber(generateTicketNumber());
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(normalizePriority(request.priority()));
        ticket.setStatus("OPEN");

        ticket.setCustomer(customer);
        ticket.setCreatedBy(agent);
        ticket.setAssignedAgent(agent);

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapToResponse(savedTicket);
    }

    // Customer creates a ticket for themselves
    @Transactional
    public TicketResponse createTicketForCustomer(
            CreateTicketRequest request,
            Authentication authentication) {

        User customer = getAuthenticatedUser(authentication);

        if (!hasRole(customer, "CUSTOMER")) {
            throw new AccessDeniedException(
                    "Only customers can create tickets");
        }

        Ticket ticket = new Ticket();

        ticket.setTicketNumber(generateTicketNumber());
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(normalizePriority(request.priority()));
        ticket.setStatus("OPEN");

        ticket.setCustomer(customer);
        ticket.setCreatedBy(customer);
        ticket.setAssignedAgent(null);

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapToResponse(savedTicket);
    }

    // Retrieve one ticket with role-based authorization
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(
            Long id,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"));

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
            tickets = ticketRepository.findByAssignedAgentIdOrCreatedById(
                    user.getId(),
                    user.getId());

        } else if (hasRole(user, "CUSTOMER")) {
            tickets = ticketRepository.findByCustomerId(user.getId());

        } else {
            throw new AccessDeniedException("Access denied");
        }

        return tickets.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Update ticket status and/or priority
    @Transactional
    public TicketResponse updateTicket(
            Long id,
            UpdateTicketRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        if (!hasRole(user, "ADMIN") && !hasRole(user, "AGENT")) {
            throw new AccessDeniedException(
                    "Only agents and admins can update tickets");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"));

        if (!hasRole(user, "ADMIN")
                && (ticket.getAssignedAgent() == null
                || !ticket.getAssignedAgent().getId().equals(user.getId()))) {

            throw new AccessDeniedException(
                    "You can only update tickets assigned to you");
        }

        if (request.status() == null && request.priority() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one field (status or priority) must be provided");
        }

        if (request.status() != null) {
            ticket.setStatus(request.status().toUpperCase());
        }

        if (request.priority() != null) {
            ticket.setPriority(request.priority().toUpperCase());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        return mapToResponse(updatedTicket);
    }

    // Generate a unique ticket number
    private String generateTicketNumber() {
        return "TKT-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // Default priority is MEDIUM
    private String normalizePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return "MEDIUM";
        }

        return priority.toUpperCase();
    }

    // Find the currently authenticated user
    private User getAuthenticatedUser(Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException(
                    "Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found"));
    }

    // Check user role
    private boolean hasRole(User user, String roleName) {

        if (user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }

        String actualRole = user.getRole().getName();

        if (actualRole.startsWith("ROLE_")) {
            actualRole = actualRole.substring(5);
        }

        return actualRole.equalsIgnoreCase(roleName);
    }

    // Check whether the user can access this ticket
    private void checkTicketAccess(Ticket ticket, User user) {

        if (hasRole(user, "ADMIN")) {
            return;
        }

        if (hasRole(user, "CUSTOMER")) {

            if (ticket.getCustomer() != null
                    && ticket.getCustomer().getId().equals(user.getId())) {
                return;
            }

            throw new AccessDeniedException(
                    "You can only access your own tickets");
        }

        if (hasRole(user, "AGENT")) {

            boolean isAssignedAgent =
                    ticket.getAssignedAgent() != null
                            && ticket.getAssignedAgent().getId().equals(user.getId());

            boolean isCreator =
                    ticket.getCreatedBy() != null
                            && ticket.getCreatedBy().getId().equals(user.getId());

            if (isAssignedAgent || isCreator) {
                return;
            }

            throw new AccessDeniedException(
                    "You can only access tickets assigned to you or created by you");
        }

        throw new AccessDeniedException("Access denied");
    }

    // Convert Ticket entity into API response
    private TicketResponse mapToResponse(Ticket ticket) {

        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getCustomer().getId(),
                ticket.getCustomer().getName(),
                ticket.getAssignedAgent() != null
                        ? ticket.getAssignedAgent().getId()
                        : null,
                ticket.getAssignedAgent() != null
                        ? ticket.getAssignedAgent().getName()
                        : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
