
package com.example.tms.dto;

import jakarta.validation.constraints.Pattern;

public record UpdateTicketRequest(

        @Pattern(
                regexp = "(?i)OPEN|IN_PROGRESS|RESOLVED|CLOSED",
                message = "Invalid ticket status"
        )
        String status,

        @Pattern(
                regexp = "(?i)LOW|MEDIUM|HIGH|URGENT",
                message = "Invalid ticket priority"
        )
        String priority

) {}
