package org.example.raizrealtors.dashboard;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.audit.AuditLog;
import org.example.raizrealtors.audit.AuditLogRepository;
import org.example.raizrealtors.booking.BookingRepository;
import org.example.raizrealtors.lead.LeadRepository;
import org.example.raizrealtors.lead.LeadStage;
import org.example.raizrealtors.property.UnitRepository;
import org.example.raizrealtors.property.UnitStatus;
import org.springframework.data.domain.PageRequest;
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

        LocalDate today = LocalDate.now();

        // =====================================================
        // 1. LEAD STAGE COUNTS
        //    We use this query for:
        //    - total leads
        //    - qualified
        //    - booked leads
        //    - pipeline
        // =====================================================

        Map<LeadStage, Long> stageCounts =
                new EnumMap<>(LeadStage.class);

        for (Object[] row : leadRepository.countLeadsByStage()) {

            LeadStage stage = (LeadStage) row[0];
            Long count = ((Number) row[1]).longValue();

            if (stage != null) {
                stageCounts.put(stage, count);
            }
        }

        // Calculate total from stage counts.
        // This avoids a separate leadRepository.count() query.
        long totalLeads = stageCounts.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();

        data.put("totalLeads", totalLeads);

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

        // =====================================================
        // 2. BOOKINGS COUNT
        // =====================================================

        data.put(
                "bookings",
                bookingRepository.count()
        );

        // =====================================================
        // 3. AVAILABLE UNIT COUNT
        // =====================================================

        data.put(
                "availableUnits",
                unitRepository.countByStatus(
                        UnitStatus.AVAILABLE
                )
        );

        // =====================================================
        // 4. RECENT ACTIVITY
        //    Convert directly to small response objects.
        //    This avoids returning full AuditLog entities.
        // =====================================================

        List<Map<String, Object>> recentActivity =
                auditLogRepository
                        .findTop5ByOrderByTimestampDesc()
                        .stream()
                        .map(this::mapAuditLog)
                        .toList();

        data.put(
                "recentActivity",
                recentActivity
        );

        // =====================================================
        // 5. FOLLOW-UPS TODAY
        //
        //    Previously:
        //       countByFollowUpDate()
        //       findByFollowUpDate()
        //
        //    Now:
        //       one query only
        //       count = list.size()
        // =====================================================

        List<Map<String, Object>> followUps =
                leadRepository
                        .findFollowUpSummaries(today)
                        .stream()
                        .map(row -> {

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put(
                                    "leadName",
                                    row[0]
                            );

                            item.put(
                                    "followUpDate",
                                    row[1]
                            );

                            item.put(
                                    "stage",
                                    row[2] != null
                                            ? ((LeadStage) row[2]).name()
                                            : null
                            );

                            return item;
                        })
                        .toList();

        data.put(
                "todayFollowUps",
                followUps.size()
        );

        data.put(
                "followUpsToday",
                followUps
        );

        // =====================================================
        // 6. SALES PIPELINE
        // =====================================================

        List<Map<String, Object>> pipeline =
                new ArrayList<>();

        for (LeadStage stage : LeadStage.values()) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "stage",
                    stage.name()
            );

            item.put(
                    "count",
                    stageCounts.getOrDefault(
                            stage,
                            0L
                    )
            );

            pipeline.add(item);
        }

        data.put(
                "pipeline",
                pipeline
        );

        // =====================================================
        // 7. UNIT AVAILABILITY BY PROJECT
        //
        // IMPORTANT:
        // Do NOT load every Unit entity anymore.
        //
        // The database calculates:
        // - total units
        // - available units
        // grouped by project.
        // =====================================================

        List<Map<String, Object>> unitAvailability =
                unitRepository
                        .findProjectUnitAvailability(
                                UnitStatus.AVAILABLE
                        )
                        .stream()
                        .map(row -> {

                            Map<String, Object> project =
                                    new LinkedHashMap<>();

                            project.put(
                                    "name",
                                    row[1]
                            );

                            project.put(
                                    "totalUnits",
                                    ((Number) row[2]).intValue()
                            );

                            project.put(
                                    "availableUnits",
                                    ((Number) row[3]).intValue()
                            );

                            return project;
                        })
                        .toList();

        data.put(
                "unitAvailability",
                unitAvailability
        );

        // =====================================================
        // 8. RECENT BOOKINGS
        //
        // Fetch only required columns instead of complete
        // Booking entities + nested objects.
        // =====================================================

        List<Map<String, Object>> recentBookings =
                bookingRepository
                        .findRecentBookingSummaries(
                                PageRequest.of(0, 6)
                        )
                        .stream()
                        .map(row -> {

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put(
                                    "leadName",
                                    row[0]
                            );

                            item.put(
                                    "unitNumber",
                                    row[1]
                            );

                            item.put(
                                    "price",
                                    row[2]
                            );

                            item.put(
                                    "bookingDate",
                                    row[3]
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

    private Map<String, Object> mapAuditLog(
            AuditLog log
    ) {

        Map<String, Object> item =
                new LinkedHashMap<>();

        item.put(
                "userName",
                log.getUser() != null
                        ? log.getUser().getName()
                        : null
        );

        item.put(
                "action",
                log.getAction()
        );

        item.put(
                "entity",
                log.getEntity()
        );

        item.put(
                "entityId",
                log.getEntityId()
        );

        item.put(
                "details",
                log.getDetails()
        );

        item.put(
                "timestamp",
                log.getTimestamp()
        );

        return item;
    }
}