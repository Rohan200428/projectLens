package com.mfrp.plens.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cohort_criteria")
public class CohortCriteria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String theme;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String learningObjectives;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String evaluationCriteria;
    @Column(nullable = false)
    private boolean active;

    protected CohortCriteria() {
    }

    public CohortCriteria(String theme, String learningObjectives, String evaluationCriteria, boolean active) {
        this.theme = theme;
        this.learningObjectives = learningObjectives;
        this.evaluationCriteria = evaluationCriteria;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getTheme() {
        return theme;
    }

    public String getLearningObjectives() {
        return learningObjectives;
    }

    public String getEvaluationCriteria() {
        return evaluationCriteria;
    }

    public boolean isActive() {
        return active;
    }
}
