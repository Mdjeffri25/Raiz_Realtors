package org.example.raizrealtors.lead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    long countByStage(LeadStage stage);

    long countByFollowUpDate(LocalDate date);

    List<Lead> findByFollowUpDate(LocalDate date);

    @Query("""
        SELECT l.stage, COUNT(l)
        FROM Lead l
        GROUP BY l.stage
        """)
    List<Object[]> countLeadsByStage();

    @Query("""
        SELECT l.name, l.followUpDate, l.stage
        FROM Lead l
        WHERE l.followUpDate = :date
        """)
    List<Object[]> findFollowUpSummaries(
            @Param("date") LocalDate date
    );
}