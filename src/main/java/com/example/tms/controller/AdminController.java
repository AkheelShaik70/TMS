
package com.example.tms.controller;

import com.example.tms.dto.AgentResponse;
import com.example.tms.dto.CreateAgentRequest;
import com.example.tms.dto.TicketResponse;
import com.example.tms.service.AdminService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Create a new AGENT
    @PostMapping("/agents")
    @ResponseStatus(HttpStatus.CREATED)
    public AgentResponse createAgent(
            @Valid @RequestBody CreateAgentRequest request) {

        return adminService.createAgent(request);
    }

    // Reassign a ticket to another AGENT
    @PatchMapping("/tickets/{id}/assign")
    public TicketResponse assignTicket(
            @PathVariable Long id,
            @RequestParam
            @NotBlank(message = "Agent email is required")
            @Email(message = "Invalid agent email")
            String agentEmail) {

        return adminService.assignTicket(id, agentEmail);
    }
}
