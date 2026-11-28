
package com.example.tms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ChatRequest(

        @NotBlank(message = "Message cannot be empty")
        @Size(max = 4000, message = "Message cannot exceed 4000 characters")
        String message,

        @Size(max = 20, message = "Conversation history cannot exceed 20 messages")
        List<@NotNull @Valid ChatMessage> history

) {

    public record ChatMessage(
            @NotBlank
            @Pattern(regexp = "user|assistant", message = "Role must be user or assistant")
            String role,

            @NotBlank
            @Size(max = 4000, message = "History messages cannot exceed 4000 characters")
            String content
    ) {
    }
}
