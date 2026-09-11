package org.example.raizrealtors.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    boolean existsByUnitId(Long unitId);

    List<Booking> findTop6ByOrderByBookingDateDesc();
}