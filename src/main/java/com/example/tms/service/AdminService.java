
package com.example.tms.service;

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

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            TicketRepository ticketRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
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

    // Reassign a ticket to another AGENT
    @Transactional
    public TicketResponse assignTicket(
            Long ticketId,
            String agentEmail) {

        String email = agentEmail.trim().toLowerCase(Locale.ROOT);

        // Find the ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found"
                ));

        // Find the new assigned agent
        User agent = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Agent not found"
                ));

        // Verify that the selected user has AGENT role
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

        // Assign ticket to the selected agent
        ticket.setAssignedAgent(agent);

        Ticket updatedTicket = ticketRepository.save(ticket);

        User customer = updatedTicket.getCustomer();
        User assignedAgent = updatedTicket.getAssignedAgent();

        return new TicketResponse(
                updatedTicket.getId(),
                updatedTicket.getTicketNumber(),
                updatedTicket.getTitle(),
                updatedTicket.getDescription(),
                updatedTicket.getCategory(),
                updatedTicket.getPriority(),
                updatedTicket.getStatus(),
                customer.getId(),
                customer.getName(),
                assignedAgent.getId(),
                assignedAgent.getName(),
                updatedTicket.getCreatedAt(),
                updatedTicket.getUpdatedAt()
        );
    }
}
