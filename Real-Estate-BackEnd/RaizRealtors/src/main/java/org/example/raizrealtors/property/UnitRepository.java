package org.example.raizrealtors.property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface UnitRepository
        extends JpaRepository<Unit, Long> {

    long countByStatus(UnitStatus status);

    @Query("""
        SELECT
            p.id,
            p.name,
            COUNT(u),
            SUM(
                CASE
                    WHEN u.status = :status THEN 1
                    ELSE 0
                END
            )
        FROM Unit u
        JOIN u.building b
        JOIN b.project p
        GROUP BY p.id, p.name
        ORDER BY p.name
        """)
    List<Object[]> findProjectUnitAvailability(
            @Param("status") UnitStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT u
        FROM Unit u
        WHERE u.id = :id
        """)
    Optional<Unit> findByIdForUpdate(
            @Param("id") Long id
    );
}