
package com.example.tms.service;

import com.example.tms.dto.FAQRequest;
import com.example.tms.dto.FAQResponse;
import com.example.tms.entity.FAQ;
import com.example.tms.repository.FAQRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FAQService {

    private final FAQRepository faqRepository;

    public FAQService(FAQRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    // Create a new FAQ
    public FAQResponse createFAQ(FAQRequest request) {

        FAQ faq = new FAQ();

        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setCategory(request.getCategory());
        faq.setPublished(false);

        FAQ savedFAQ = faqRepository.save(faq);

        return mapToResponse(savedFAQ);
    }

    // Update an existing FAQ
    public FAQResponse updateFAQ(Long id, FAQRequest request) {

        FAQ faq = getFAQEntity(id);

        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setCategory(request.getCategory());

        FAQ updatedFAQ = faqRepository.save(faq);

        return mapToResponse(updatedFAQ);
    }

    // Retrieve all published FAQs
    @Transactional(readOnly = true)
    public List<FAQResponse> getPublishedFAQs() {

        return faqRepository.findByPublishedTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieve published FAQs by category
    @Transactional(readOnly = true)
    public List<FAQResponse> getPublishedFAQsByCategory(String category) {

        return faqRepository
                .findByCategoryIgnoreCaseAndPublishedTrue(category)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ADMIN: Retrieve all FAQs
    @Transactional(readOnly = true)
    public List<FAQResponse> getAllFAQs() {

        return faqRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieve one FAQ by ID
    @Transactional(readOnly = true)
    public FAQResponse getFAQById(Long id) {

        return mapToResponse(getFAQEntity(id));
    }

    // Publish or unpublish an FAQ
    public FAQResponse updatePublishedStatus(Long id, boolean published) {

        FAQ faq = getFAQEntity(id);

        faq.setPublished(published);

        FAQ updatedFAQ = faqRepository.save(faq);

        return mapToResponse(updatedFAQ);
    }

    // Delete an FAQ
    public void deleteFAQ(Long id) {

        FAQ faq = getFAQEntity(id);

        faqRepository.delete(faq);
    }

    // Find FAQ entity or throw exception
    private FAQ getFAQEntity(Long id) {

        return faqRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "FAQ not found with ID: " + id
                        )
                );
    }

    // Convert Entity to Response DTO
    private FAQResponse mapToResponse(FAQ faq) {

        return new FAQResponse(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getCategory(),
                faq.isPublished(),
                faq.getCreatedAt(),
                faq.getUpdatedAt()
        );
    }
}
