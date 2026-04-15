package com.platform.entity;

import com.platform.converter.JsonMapConverter;
import com.platform.converter.JsonObjectConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.Map;

@Entity
@Table(name = "test_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Convert(converter = JsonMapConverter.class)
    @Column(columnDefinition = "text", nullable = false)
    private Map<String, Object> inputJson;

    @Convert(converter = JsonObjectConverter.class)
    @Column(columnDefinition = "text", nullable = false)
    private Object expectedOutputJson;

    @Column(nullable = false)
    private boolean isHidden;
}
