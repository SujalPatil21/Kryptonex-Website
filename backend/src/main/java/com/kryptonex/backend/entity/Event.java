package com.kryptonex.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate date;
    private LocalTime time;

    private String instructorName;
    private String instructorRole;
    private String instructorStats;

    private boolean isFeatured;
}
