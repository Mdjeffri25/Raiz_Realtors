package org.example.raizrealtors.dashboard;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.booking.Booking;
import org.example.raizrealtors.booking.BookingRepository;
import org.example.raizrealtors.lead.LeadRepository;
import org.example.raizrealtors.lead.LeadStage;
import org.example.raizrealtors.property.Unit;
import org.example.raizrealtors.property.UnitRepository;
import org.example.raizrealtors.property.UnitStatus;
import org.springframework.stereotype.Service;
import org.example.raizrealtors.audit.AuditLog;
import org.example.raizrealtors.audit.AuditLogRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final UnitRepository unitRepository;
    private final AuditLogRepository auditLogRepository;

    public Map<String, Object> getDashboard() {

        Map<String, Object> data = new LinkedHashMap<>();

        // =========================
        // TOP METRICS
        // =========================

        data.put("totalLeads", leadRepository.count());

        data.put(
                "qualified",
                leadRepository.countByStage(LeadStage.INTERESTED)
        );

        data.put(
                "bookedLeads",
                leadRepository.countByStage(LeadStage.BOOKED)
        );

        data.put(
                "bookings",
                bookingRepository.count()
        );

        data.put(
                "availableUnits",
                unitRepository.countByStatus(UnitStatus.AVAILABLE)
        );
  data.put(
        "recentActivity",
        auditLogRepository.findTop5ByOrderByTimestampDesc()
);
        data.put(
                "todayFollowUps",
                leadRepository.countByFollowUpDate(LocalDate.now())
        );

        // =========================
        // SALES PIPELINE
        // =========================

        List<Map<String, Object>> pipeline = new ArrayList<>();

        for (LeadStage stage : LeadStage.values()) {

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("stage", stage.name());
            item.put(
                    "count",
                    leadRepository.countByStage(stage)
            );

            pipeline.add(item);
        }

        data.put("pipeline", pipeline);

        // =========================
        // FOLLOW-UPS TODAY
        // =========================

        List<Map<String, Object>> followUps = new ArrayList<>();

        leadRepository.findByFollowUpDate(LocalDate.now())
                .forEach(lead -> {

                    Map<String, Object> item = new LinkedHashMap<>();

                    item.put("leadName", lead.getName());
                    item.put("followUpDate", lead.getFollowUpDate());
                    item.put(
                            "stage",
                            lead.getStage() != null
                                    ? lead.getStage().name()
                                    : null
                    );

                    followUps.add(item);
                });

        data.put("followUpsToday", followUps);

        // =========================
        // UNIT AVAILABILITY
        // =========================

        Map<Long, Map<String, Object>> projectMap = new LinkedHashMap<>();

        List<Unit> units = unitRepository.findAll();

        for (Unit unit : units) {

            if (unit.getBuilding() == null ||
                    unit.getBuilding().getProject() == null) {
                continue;
            }

            Long projectId = unit.getBuilding()
                    .getProject()
                    .getId();

            String projectName = unit.getBuilding()
                    .getProject()
                    .getName();

            Map<String, Object> project =
                    projectMap.computeIfAbsent(projectId, id -> {

                        Map<String, Object> p = new LinkedHashMap<>();

                        p.put("name", projectName);
                        p.put("totalUnits", 0);
                        p.put("availableUnits", 0);

                        return p;
                    });

            project.put(
                    "totalUnits",
                    (Integer) project.get("totalUnits") + 1
            );

            if (unit.getStatus() == UnitStatus.AVAILABLE) {

                project.put(
                        "availableUnits",
                        (Integer) project.get("availableUnits") + 1
                );
            }
        }

        data.put(
                "unitAvailability",
                new ArrayList<>(projectMap.values())
        );

        // =========================
        // RECENT BOOKINGS
        // =========================

        List<Map<String, Object>> recentBookings =
                bookingRepository.findAll()
                        .stream()
                        .sorted(
                                Comparator.comparing(
                                        Booking::getBookingDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(6)
                        .map(booking -> {

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put(
                                    "leadName",
                                    booking.getLead() != null
                                            ? booking.getLead().getName()
                                            : null
                            );

                            item.put(
                                    "unitNumber",
                                    booking.getUnit() != null
                                            ? booking.getUnit().getUnitNumber()
                                            : null
                            );

                            item.put(
                                    "price",
                                    booking.getUnit() != null
                                            ? booking.getUnit().getPrice()
                                            : null
                            );

                            item.put(
                                    "bookingDate",
                                    booking.getBookingDate()
                            );

                            return item;
                        })
                        .collect(Collectors.toList());

        data.put("recentBookings", recentBookings);

        // =========================
        // RECENT ACTIVITY
        // =========================

        // Audit activity can be connected here when the
        // audit-log repository is available.
        // data.put(
        //         "recentActivity",
        //         new ArrayList<>()
        // );

        return data;
    }
}