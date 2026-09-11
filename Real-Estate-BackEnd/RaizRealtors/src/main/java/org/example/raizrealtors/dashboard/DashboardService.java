package org.example.raizrealtors.dashboard;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.audit.AuditLogRepository;
import org.example.raizrealtors.booking.Booking;
import org.example.raizrealtors.booking.BookingRepository;
import org.example.raizrealtors.lead.Lead;
import org.example.raizrealtors.lead.LeadRepository;
import org.example.raizrealtors.lead.LeadStage;
import org.example.raizrealtors.property.Unit;
import org.example.raizrealtors.property.UnitRepository;
import org.example.raizrealtors.property.UnitStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

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
        // LEAD STAGE COUNTS
        // =========================

        Map<LeadStage, Long> stageCounts =
                new EnumMap<>(LeadStage.class);

        for (Object[] row : leadRepository.countLeadsByStage()) {

            LeadStage stage = (LeadStage) row[0];
            Long count = (Long) row[1];

            if (stage != null) {
                stageCounts.put(stage, count);
            }
        }

        // =========================
        // TOP METRICS
        // =========================

        data.put(
                "totalLeads",
                leadRepository.count()
        );

        data.put(
                "qualified",
                stageCounts.getOrDefault(
                        LeadStage.INTERESTED,
                        0L
                )
        );

        data.put(
                "bookedLeads",
                stageCounts.getOrDefault(
                        LeadStage.BOOKED,
                        0L
                )
        );

        data.put(
                "bookings",
                bookingRepository.count()
        );

        data.put(
                "availableUnits",
                unitRepository.countByStatus(
                        UnitStatus.AVAILABLE
                )
        );

        // =========================
        // RECENT ACTIVITY
        // =========================

        data.put(
                "recentActivity",
                auditLogRepository.findTop5ByOrderByTimestampDesc()
        );

        // =========================
        // FOLLOW-UPS TODAY
        // =========================

        LocalDate today = LocalDate.now();

        data.put(
                "todayFollowUps",
                leadRepository.countByFollowUpDate(today)
        );

        // =========================
        // SALES PIPELINE
        // =========================

        List<Map<String, Object>> pipeline =
                new ArrayList<>();

        for (LeadStage stage : LeadStage.values()) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put("stage", stage.name());

            item.put(
                    "count",
                    stageCounts.getOrDefault(stage, 0L)
            );

            pipeline.add(item);
        }

        data.put("pipeline", pipeline);

        // =========================
        // FOLLOW-UPS TODAY
        // =========================

        List<Map<String, Object>> followUps =
                new ArrayList<>();

        leadRepository.findByFollowUpDate(today)
                .forEach(lead -> {

                    Map<String, Object> item =
                            new LinkedHashMap<>();

                    item.put(
                            "leadName",
                            lead.getName()
                    );

                    item.put(
                            "followUpDate",
                            lead.getFollowUpDate()
                    );

                    item.put(
                            "stage",
                            lead.getStage() != null
                                    ? lead.getStage().name()
                                    : null
                    );

                    followUps.add(item);
                });

        data.put(
                "followUpsToday",
                followUps
        );

        // =========================
        // UNIT AVAILABILITY
        // =========================

        Map<Long, Map<String, Object>> projectMap =
                new LinkedHashMap<>();

        List<Unit> units =
                unitRepository.findAll();

        for (Unit unit : units) {

            if (unit.getBuilding() == null ||
                    unit.getBuilding().getProject() == null) {
                continue;
            }

            Long projectId =
                    unit.getBuilding()
                            .getProject()
                            .getId();

            String projectName =
                    unit.getBuilding()
                            .getProject()
                            .getName();

            Map<String, Object> project =
                    projectMap.computeIfAbsent(
                            projectId,
                            id -> {

                                Map<String, Object> p =
                                        new LinkedHashMap<>();

                                p.put(
                                        "name",
                                        projectName
                                );

                                p.put(
                                        "totalUnits",
                                        0
                                );

                                p.put(
                                        "availableUnits",
                                        0
                                );

                                return p;
                            }
                    );

            project.put(
                    "totalUnits",
                    (Integer) project.get("totalUnits") + 1
            );

            if (unit.getStatus() ==
                    UnitStatus.AVAILABLE) {

                project.put(
                        "availableUnits",
                        (Integer) project.get(
                                "availableUnits"
                        ) + 1
                );
            }
        }

        data.put(
                "unitAvailability",
                new ArrayList<>(
                        projectMap.values()
                )
        );

        // =========================
        // RECENT BOOKINGS
        // =========================

        List<Map<String, Object>> recentBookings =
                bookingRepository
                        .findTop6ByOrderByBookingDateDesc()
                        .stream()
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
                        .toList();

        data.put(
                "recentBookings",
                recentBookings
        );

        return data;
    }
}