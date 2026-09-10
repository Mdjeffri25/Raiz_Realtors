package org.example.raizrealtors.lead;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    long countByStage(LeadStage stage);

    long countByFollowUpDate(LocalDate date);
}