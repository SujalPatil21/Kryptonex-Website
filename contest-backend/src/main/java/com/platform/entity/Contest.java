package com.platform.entity;

import com.platform.entity.enums.ContestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private OffsetDateTime startTime;

    @Column(nullable = false)
    private OffsetDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Problem> problems = new ArrayList<>();

    // Status is derived dynamically based on time
    @Transient
    public ContestStatus getStatus() {
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(startTime)) {
            return ContestStatus.UPCOMING;
        } else if (now.isAfter(endTime)) {
            return ContestStatus.ENDED;
        } else {
            return ContestStatus.LIVE;
        }
    }
}
