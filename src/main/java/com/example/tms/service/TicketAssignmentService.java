
package com.example.tms.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.tms.entity.Ticket;
import com.example.tms.entity.User;
import com.example.tms.repository.TicketRepository;
import com.example.tms.repository.UserRepository;

@Service
public class TicketAssignmentService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public TicketAssignmentService(
            UserRepository userRepository,
            TicketRepository ticketRepository) {

        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    // Automatically assign a ticket to the least-loaded agent
    public void assignAutomatically(Ticket ticket) {

        List<User> agents = userRepository.findAllByRole_Name("AGENT");

        if (agents.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No agents are available for ticket assignment."
            );
        }

        List<String> activeStatuses = List.of(
                "OPEN",
                "IN_PROGRESS"
        );

        // Select the agent with the fewest active tickets.
        // If workloads are equal, select the agent with the lowest ID.
        User selectedAgent = agents.stream()
                .min(Comparator
                        .comparingLong((User agent) ->
                                ticketRepository.countByAssignedAgentIdAndStatusIn(
                                        agent.getId(),
                                        activeStatuses
                                ))
                        .thenComparing(User::getId))
                .orElseThrow();

        ticket.setAssignedAgent(selectedAgent);
        ticket.setAssignmentType("AUTO_ASSIGNED");
    }
}
