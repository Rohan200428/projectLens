package com.mfrp.plens.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private Submission submission;
    @Column(nullable = false)
    private int alignmentScore;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String matchedCriteria;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String missingCriteria;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OverlapLevel overlapLevel;
    @Column(nullable = false)
    private boolean overlapFlag;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String analysisSummary;
    @Column(nullable = false)
    private LocalDateTime evaluatedAt;

    protected Evaluation() {
    }

    public Evaluation(Submission s, int score, String matched, String missing, OverlapLevel level, boolean flag,
            String summary) {
        this.submission = s;
        this.alignmentScore = score;
        this.matchedCriteria = matched;
        this.missingCriteria = missing;
        this.overlapLevel = level;
        this.overlapFlag = flag;
        this.analysisSummary = summary;
        this.evaluatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public int getAlignmentScore() {
        return alignmentScore;
    }

    public String getMatchedCriteria() {
        return matchedCriteria;
    }

    public String getMissingCriteria() {
        return missingCriteria;
    }

    public OverlapLevel getOverlapLevel() {
        return overlapLevel;
    }

    public boolean isOverlapFlag() {
        return overlapFlag;
    }

    public String getAnalysisSummary() {
        return analysisSummary;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }
}
