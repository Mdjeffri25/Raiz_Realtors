package org.example.raizrealtors.dashboard;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.booking.BookingRepository;
import org.example.raizrealtors.lead.LeadRepository;
import org.example.raizrealtors.lead.LeadStage;
import org.example.raizrealtors.property.UnitRepository;
import org.example.raizrealtors.property.UnitStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final UnitRepository unitRepository;

    public Map<String, Object> getDashboard() {

        Map<String, Object> data = new LinkedHashMap<>();

        // Total leads
        data.put("totalLeads", leadRepository.count());

        // Qualified leads
        data.put(
                "qualified",
                leadRepository.countByStage(LeadStage.INTERESTED)
        );

        // Booked leads
        data.put(
                "bookedLeads",
                leadRepository.countByStage(LeadStage.BOOKED)
        );

        // Total bookings
        data.put(
                "bookings",
                bookingRepository.count()
        );

        // Available units
        data.put(
                "availableUnits",
                unitRepository.countByStatus(UnitStatus.AVAILABLE)
        );

        // Today's follow-ups
        data.put(
                "todayFollowUps",
                leadRepository.countByFollowUpDate(LocalDate.now())
        );

        return data;
    }
}