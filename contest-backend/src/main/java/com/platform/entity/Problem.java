package com.platform.entity;

import com.platform.entity.enums.Difficulty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    private Integer timeLimit;

    @Column(columnDefinition = "TEXT")
    private String sampleInput;

    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    /**
     * Name of the method the user must implement inside their Solution class.
     * Example: "twoSum"
     */
    @Column(nullable = false)
    private String functionName;

    /**
     * Java return type of the function.
     * Example: "int[]", "int", "String", "boolean"
     */
    @Column(nullable = false)
    private String returnType;

    /**
     * Comma-separated, ordered list of Java parameter types.
     * Example: "int[],int" means the function takes (int[] nums, int target).
     * Stored as a single string to avoid a separate join table.
     */
    @Column(nullable = false)
    private String parameterTypes;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Submission> submissions = new ArrayList<>();
}
