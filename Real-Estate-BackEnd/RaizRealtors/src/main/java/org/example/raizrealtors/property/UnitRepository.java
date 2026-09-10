package org.example.raizrealtors.property;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    // Count units by status
    long countByStatus(UnitStatus status);

    // Lock unit during booking to prevent double booking
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM Unit u WHERE u.id = :id")
    Optional<Unit> findByIdForUpdate(@Param("id") Long id);
}