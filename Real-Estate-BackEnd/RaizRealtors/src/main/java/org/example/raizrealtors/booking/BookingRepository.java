package org.example.raizrealtors.booking;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    boolean existsByUnitId(Long unitId);

    List<Booking> findTop6ByOrderByBookingDateDesc();

    @Query("""
        SELECT
            b.lead.name,
            b.unit.unitNumber,
            b.unit.price,
            b.bookingDate
        FROM Booking b
        ORDER BY b.bookingDate DESC
        """)
    List<Object[]> findRecentBookingSummaries(
            Pageable pageable
    );
}