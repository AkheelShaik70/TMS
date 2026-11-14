
package com.example.tms.repository;

import com.example.tms.entity.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FAQRepository extends JpaRepository<FAQ, Long> {

    List<FAQ> findByPublishedTrue();

    List<FAQ> findByCategoryIgnoreCaseAndPublishedTrue(String category);
}
