
package com.example.tms.controller;

import com.example.tms.dto.FAQRequest;
import com.example.tms.dto.FAQResponse;
import com.example.tms.service.FAQService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FAQController {

    private final FAQService faqService;

    public FAQController(FAQService faqService) {
        this.faqService = faqService;
    }

    // CUSTOMER, AGENT and ADMIN: View published FAQs
    @GetMapping("/faqs")
    public ResponseEntity<List<FAQResponse>> getPublishedFAQs(
            @RequestParam(required = false) String category) {

        List<FAQResponse> faqs;

        if (category != null && !category.isBlank()) {
            faqs = faqService.getPublishedFAQsByCategory(category);
        } else {
            faqs = faqService.getPublishedFAQs();
        }

        return ResponseEntity.ok(faqs);
    }

    // ADMIN: View all FAQs, including unpublished ones
    @GetMapping("/admin/faqs")
    public ResponseEntity<List<FAQResponse>> getAllFAQs() {

        return ResponseEntity.ok(faqService.getAllFAQs());
    }

    // ADMIN: View a specific FAQ
    @GetMapping("/admin/faqs/{id}")
    public ResponseEntity<FAQResponse> getFAQById(
            @PathVariable Long id) {

        return ResponseEntity.ok(faqService.getFAQById(id));
    }

    // ADMIN: Create a new FAQ
    @PostMapping("/admin/faqs")
    public ResponseEntity<FAQResponse> createFAQ(
            @Valid @RequestBody FAQRequest request) {

        FAQResponse response = faqService.createFAQ(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ADMIN: Update an existing FAQ
    @PutMapping("/admin/faqs/{id}")
    public ResponseEntity<FAQResponse> updateFAQ(
            @PathVariable Long id,
            @Valid @RequestBody FAQRequest request) {

        return ResponseEntity.ok(
                faqService.updateFAQ(id, request)
        );
    }

    // ADMIN: Publish an FAQ
    @PatchMapping("/admin/faqs/{id}/publish")
    public ResponseEntity<FAQResponse> publishFAQ(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                faqService.updatePublishedStatus(id, true)
        );
    }

    // ADMIN: Unpublish an FAQ
    @PatchMapping("/admin/faqs/{id}/unpublish")
    public ResponseEntity<FAQResponse> unpublishFAQ(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                faqService.updatePublishedStatus(id, false)
        );
    }

    // ADMIN: Delete an FAQ
    @DeleteMapping("/admin/faqs/{id}")
    public ResponseEntity<Void> deleteFAQ(
            @PathVariable Long id) {

        faqService.deleteFAQ(id);

        return ResponseEntity.noContent().build();
    }
}
