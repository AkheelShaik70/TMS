
package com.example.tms.controller;

import com.example.tms.dto.ChatRequest;
import com.example.tms.dto.ChatResponse;
import com.example.tms.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {

        ChatResponse response =
                chatService.generateReply(request.message(), request.history());

        return ResponseEntity.ok(response);
    }
}

