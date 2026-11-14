
package com.example.tms.dto;

import java.time.LocalDateTime;

public class FAQResponse {

    private Long id;
    private String question;
    private String answer;
    private String category;
    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FAQResponse() {}

    public FAQResponse(
            Long id,
            String question,
            String answer,
            String category,
            boolean published,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.question = question;
        this.answer = answer;
        this.category = category;
        this.published = published;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public String getAnswer() {
        return answer;
    }

    public String getCategory() {
        return category;
    }

    public boolean isPublished() {
        return published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
