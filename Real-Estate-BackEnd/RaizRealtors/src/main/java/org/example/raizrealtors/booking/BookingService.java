package org.example.raizrealtors.booking;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.audit.AuditService;
import org.example.raizrealtors.lead.Lead;
import org.example.raizrealtors.lead.LeadRepository;
import org.example.raizrealtors.lead.LeadStage;
import org.example.raizrealtors.property.Unit;
import org.example.raizrealtors.property.UnitRepository;
import org.example.raizrealtors.property.UnitStatus;
import org.example.raizrealtors.user.User;
import org.example.raizrealtors.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final LeadRepository leadRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;


    // ==========================================
    // GET ALL BOOKINGS
    // ==========================================

    public List<Booking> getAllBookings() {

        return bookingRepository.findAll();
    }


    // ==========================================
    // CREATE BOOKING
    // ==========================================

    @Transactional
    public Booking createBooking(
            Long leadId,
            Long unitId,
            String userEmail) {


        // ------------------------------------------
        // 1. Find and LOCK the unit
        // ------------------------------------------

        Unit unit = unitRepository
                .findByIdForUpdate(unitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Unit not found"
                        )
                );


        // ------------------------------------------
        // 2. Check whether unit is already booked
        // ------------------------------------------

        if (unit.getStatus() == UnitStatus.BOOKED) {

            throw new RuntimeException(
                    "Unit is already booked"
            );
        }


        // ------------------------------------------
        // 3. Find Lead
        // ------------------------------------------

        Lead lead = leadRepository
                .findById(leadId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Lead not found"
                        )
                );


        // ------------------------------------------
        // 4. Find logged-in user
        // ------------------------------------------

        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        // ------------------------------------------
        // 5. Mark unit as BOOKED
        // ------------------------------------------

        unit.setStatus(UnitStatus.BOOKED);


        // ------------------------------------------
        // 6. Create Booking
        // ------------------------------------------

        Booking booking = Booking.builder()
                .lead(lead)
                .unit(unit)
                .bookedBy(user)
                .bookingDate(LocalDateTime.now())
                .build();


        // ------------------------------------------
        // 7. Update Lead Stage
        // ------------------------------------------

        lead.setStage(LeadStage.BOOKED);


        // ------------------------------------------
        // 8. Save Booking
        // ------------------------------------------

        Booking savedBooking = bookingRepository.save(booking);


        // ------------------------------------------
        // 9. Create Audit Log
        // ------------------------------------------

        auditService.log(
                user,
                "BOOKED",
                "UNIT",
                unit.getId(),
                "Booked unit "
                        + unit.getUnitNumber()
                        + " for lead "
                        + lead.getName()
        );


        // ------------------------------------------
        // 10. Return Booking
        // ------------------------------------------

        return savedBooking;
    }
}