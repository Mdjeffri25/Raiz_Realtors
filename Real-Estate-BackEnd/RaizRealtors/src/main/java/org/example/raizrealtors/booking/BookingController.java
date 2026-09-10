package org.example.raizrealtors.booking;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // =========================
    // GET ALL BOOKINGS
    // =========================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<List<Booking>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    // =========================
    // CREATE BOOKING
    // =========================
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE')")
    public ResponseEntity<Booking> createBooking(
            @RequestParam Long leadId,
            @RequestParam Long unitId,
            Authentication authentication) {

        Booking booking =
                bookingService.createBooking(
                        leadId,
                        unitId,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(booking);
    }
}