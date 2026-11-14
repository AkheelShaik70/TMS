
package com.example.tms.repository;

import com.example.tms.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCustomerId(Long customerId);

    List<Ticket> findByCreatedById(Long agentId);

    List<Ticket> findByAssignedAgentId(Long agentId);

    // Find tickets created by OR assigned to an agent
    List<Ticket> findByAssignedAgentIdOrCreatedById(
            Long assignedAgentId,
            Long createdById
    );
}
