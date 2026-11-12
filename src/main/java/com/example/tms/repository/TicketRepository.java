
package com.example.tms.repository;

import com.example.tms.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Find tickets raised by a particular customer
    List<Ticket> findByCustomerId(Long customerId);

    // Find tickets created by a particular agent
    List<Ticket> findByCreatedById(Long agentId);

    // Find tickets assigned to a particular agent
    List<Ticket> findByAssignedAgentId(Long agentId);
}
