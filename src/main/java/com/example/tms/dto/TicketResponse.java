
package com.example.tms.dto;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String ticketNumber,
        String title,
        String description,
        String category,
        String priority,
        String status,
        Long customerId,
        String customerName,
        Long assignedAgentId,
        String assignedAgentName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        String assignmentType
) {}
