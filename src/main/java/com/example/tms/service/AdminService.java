
package com.example.tms.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.tms.dto.AgentResponse;
import com.example.tms.dto.CreateAgentRequest;
import com.example.tms.dto.TicketResponse;
import com.example.tms.entity.Role;
import com.example.tms.entity.Ticket;
import com.example.tms.entity.User;
import com.example.tms.repository.RoleRepository;
import com.example.tms.repository.TicketRepository;
import com.example.tms.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;
    private final TicketAssignmentService ticketAssignmentService;

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TicketRepository ticketRepository,
            PasswordEncoder passwordEncoder,
            TicketAssignmentService ticketAssignmentService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
        this.ticketAssignmentService = ticketAssignmentService;
    }

    // Create a new AGENT account
    @Transactional
    public AgentResponse createAgent(CreateAgentRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered."
            );
        }

        Role agentRole = roleRepository.findByName("AGENT")
                .orElseThrow(() -> new IllegalStateException(
                        "AGENT role has not been initialized."
                ));

        User agent = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                agentRole
        );

        User savedAgent = userRepository.save(agent);

        return new AgentResponse(
                savedAgent.getId(),
                savedAgent.getName(),
                savedAgent.getEmail(),
                savedAgent.getRole().getName()
        );
    }

    // Retrieve all users with AGENT role
    public List<AgentResponse> getAllAgents() {

        return userRepository.findAllByRole_Name("AGENT")
                .stream()
                .map(agent -> new AgentResponse(
                        agent.getId(),
                        agent.getName(),
                        agent.getEmail(),
                        agent.getRole().getName()
                ))
                .toList();
    }

    // Manually assign or reassign a ticket
    @Transactional
    public TicketResponse assignTicket(
            Long ticketId,
            String agentEmail) {

        String email = agentEmail.trim().toLowerCase(Locale.ROOT);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        User agent = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Agent not found"
                ));

        String roleName = agent.getRole().getName();

        if (roleName.startsWith("ROLE_")) {
            roleName = roleName.substring(5);
        }

        if (!roleName.equalsIgnoreCase("AGENT")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected user is not an AGENT"
            );
        }

        ticket.setAssignedAgent(agent);
        ticket.setAssignmentType("ADMIN_ASSIGNED");

        Ticket updatedTicket = ticketRepository.save(ticket);

        return buildTicketResponse(updatedTicket);
    }

    // Automatically assign or reassign a ticket
    @Transactional
    public TicketResponse autoAssignTicket(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        if ("RESOLVED".equalsIgnoreCase(ticket.getStatus())
                || "CLOSED".equalsIgnoreCase(ticket.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Resolved or closed tickets cannot be assigned."
            );
        }

        ticketAssignmentService.assignAutomatically(ticket);

        Ticket updatedTicket = ticketRepository.save(ticket);

        return buildTicketResponse(updatedTicket);
    }

    // Convert Ticket entity into TicketResponse
    private TicketResponse buildTicketResponse(Ticket ticket) {

        User customer = ticket.getCustomer();
        User assignedAgent = ticket.getAssignedAgent();

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
                assignedAgent.getId(),
                assignedAgent.getName(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt(),
                ticket.getAssignmentType()
        );
    }
}
