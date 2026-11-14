
package com.example.tms.controller;

import com.example.tms.dto.AgentResponse;
import com.example.tms.dto.CreateAgentRequest;
import com.example.tms.service.AdminService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/agents")
    @ResponseStatus(HttpStatus.CREATED)
    public AgentResponse createAgent(
            @Valid @RequestBody CreateAgentRequest request) {

        return adminService.createAgent(request);
    }
}
