package org.example.raizrealtors.booking;



import org.example.raizrealtors.lead.Lead;
import org.example.raizrealtors.property.Unit;
import org.example.raizrealtors.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Lead lead;

    @ManyToOne(optional = false)
    private Unit unit;

    @ManyToOne(optional = false)
    private User bookedBy;

    @Column(nullable = false)
    private LocalDateTime bookingDate;
}
