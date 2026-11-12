
package com.example.tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @NotBlank
        @Size(max = 2000)
        String description,

        @NotBlank
        @Size(max = 40)
        String category,

        @Size(max = 20)
        String priority

) {}
