
package com.example.tms.controller;

import com.example.tms.dto.CreateTicketRequest;
import com.example.tms.dto.TicketResponse;
import com.example.tms.dto.UpdateTicketRequest;
import com.example.tms.service.TicketService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Agent creates a ticket on behalf of a customer
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @RequestParam String customerEmail,
            Authentication authentication) {

        return ticketService.createTicket(
                request,
                customerEmail,
                authentication
        );
    }

    // Retrieve one ticket with role-based authorization
    @GetMapping("/{id}")
    public TicketResponse getTicketById(
            @PathVariable Long id,
            Authentication authentication) {

        return ticketService.getTicketById(id, authentication);
    }

    // Retrieve tickets according to the logged-in user's role
    @GetMapping
    public List<TicketResponse> getAllTickets(
            Authentication authentication) {

        return ticketService.getAllTickets(authentication);
    }

    // Update ticket status and/or priority
    @PatchMapping("/{id}")
    public TicketResponse updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            Authentication authentication) {

        return ticketService.updateTicket(
                id,
                request,
                authentication
        );
    }
}
