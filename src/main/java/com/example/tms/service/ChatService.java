
package com.example.tms.service;

import com.example.tms.dto.ChatResponse;
import com.example.tms.dto.ChatRequest.ChatMessage;
import com.example.tms.exception.AiChatUnavailableException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Locale;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@Service
public class ChatService {

    private final RestClient restClient;

    private static final String SYSTEM_PROMPT = """
            You are SupportAI, a professional customer support
            assistant for a ticket management system.

            Your responsibilities:
            1. Help customers understand how to create support tickets.
            2. Guide customers on checking ticket status.
            3. Answer questions about FAQs and support procedures.
            4. Provide basic technical troubleshooting guidance.
            5. Ask relevant follow-up questions when information
               is missing.

            Communication guidelines:
            1. Be polite, friendly, and professional.
            2. Use simple language that beginners can understand.
            3. Keep answers clear, relevant, and concise.
            4. Stay focused on customer support.
            5. Never claim that a ticket was created, updated,
               assigned, or resolved unless an actual system
               operation confirms it.
            6. Never invent ticket IDs, customer records,
               or ticket statuses.
            7. If you cannot perform an operation, explain
               how the customer can proceed through the system.

            Your primary goal is to help customers resolve
            their support-related questions.
            """;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.model:openai/gpt-oss-20b}")
    private String model;

    @Value("${groq.mock.enabled:${openai.mock.enabled:false}}")
    private boolean mockEnabled;

    public ChatService(RestClient groqRestClient) {
        this.restClient = groqRestClient;
    }

    public ChatResponse generateReply(String message) {
        return generateReply(message, List.of());
    }

    public ChatResponse generateReply(
            String message,
            List<ChatMessage> history) {

        if (mockEnabled) {
            return generateMockReply(message);
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new AiChatUnavailableException(
                    "Groq API key is not configured. Set GROQ_API_KEY "
                            + "or enable chatbot mock mode."
            );
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        if (history != null) {
            history.forEach(item -> messages.add(Map.of(
                    "role", item.role(),
                    "content", item.content()
            )));
        }
        messages.add(Map.of("role", "user", "content", message));

        JsonNode response = restClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .body(Map.of(
                        "model", model,
                        "messages", messages,
                        "max_completion_tokens", 512
                ))
                .retrieve()
                .body(JsonNode.class);

        String reply = response == null
                ? ""
                : response.path("choices").path(0)
                        .path("message").path("content").asText("");

        if (reply.isBlank()) {
            throw new AiChatUnavailableException(
                    "Groq returned no text response"
            );
        }

        return new ChatResponse(reply);
    }

    // Intent-based mock chatbot
    private ChatResponse generateMockReply(String message) {

        String input = message.toLowerCase(Locale.ROOT).trim();

        String reply;
        String detectedIntent;

        if (containsAny(input,
                "create ticket", "raise ticket",
                "new ticket", "submit ticket",
                "create a ticket", "raise a ticket",
                "need a ticket", "open a ticket",
                "want to create", "want to raise")) {

            detectedIntent = "TICKET_CREATION";

            reply = "To create a support ticket, please describe "
                    + "your issue, select the appropriate category, "
                    + "and submit your request. Our support team "
                    + "will review and assist you.";

        } else if (containsAny(input,
                "ticket status", "check ticket",
                "track ticket", "ticket update",
                "status of my ticket", "where is my ticket")) {

            detectedIntent = "TICKET_STATUS";

            reply = "You can check your ticket status using "
                    + "your ticket ID. Please provide your ticket ID "
                    + "or visit the ticket management section.";

        } else if (containsAny(input,
                "faq", "frequently asked",
                "common questions", "help articles")) {

            detectedIntent = "FAQ";

            reply = "Our FAQ section contains answers to common "
                    + "customer questions. You can browse the "
                    + "available FAQs to find a solution.";

        } else if (containsAny(input,
                "technical issue", "error",
                "not working", "bug", "problem",
                "technical problem", "application issue")) {

            detectedIntent = "TECHNICAL_SUPPORT";

            reply = "I'm sorry you're experiencing a technical "
                    + "issue. Please describe the problem, including "
                    + "any error message you received. You can also "
                    + "raise a support ticket for further assistance.";

        } else if (containsAny(input,
                "hello", "hi", "hey", "good morning",
                "good afternoon", "good evening")) {

            detectedIntent = "GREETING";

            reply = "Hello! Welcome to SupportAI. "
                    + "How can I help you today? I can assist with "
                    + "ticket creation, ticket status, FAQs, "
                    + "and technical issues.";

        } else {

            detectedIntent = "GENERAL_FALLBACK";

            reply = "Thank you for contacting SupportAI. "
                    + "I can help you create a support ticket, "
                    + "check ticket status, find FAQs, or troubleshoot "
                    + "technical issues. Could you provide more details "
                    + "about your concern?";
        }

        System.out.println("CHATBOT DETECTED INTENT: " + detectedIntent);

        return new ChatResponse(reply);
    }

    // Check whether the message contains any supported keyword
    private boolean containsAny(String input, String... keywords) {

        for (String keyword : keywords) {
            if (input.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}
