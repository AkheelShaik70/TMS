
package com.example.tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePasswordRequest(

        @NotBlank(message = "New password is required.")
        @Size(
                min = 8,
                max = 100,
                message = "Password must be between 8 and 100 characters."
        )
        String newPassword

) {}
