package com.mfrp.plens.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pod_lead_id", nullable = false)
    private User podLead;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criteria_id", nullable = false)
    private CohortCriteria criteria;
    @Column(nullable = false)
    private String projectTitle;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String problemStatement;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String objectives;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String technologyStack;
    @Column(columnDefinition = "TEXT")
    private String documentationLink;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SubmissionStatus status;
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected Submission() {
    }

    public Submission(User lead, CohortCriteria criteria, String title, String problem, String objectives, String stack,
            String link) {
        this.podLead = lead;
        this.criteria = criteria;
        this.projectTitle = title;
        this.problemStatement = problem;
        this.objectives = objectives;
        this.technologyStack = stack;
        this.documentationLink = link;
        this.status = SubmissionStatus.PENDING_ANALYSIS;
        this.submittedAt = LocalDateTime.now();
        this.updatedAt = this.submittedAt;
    }

    public void revise(String title, String problem, String objectives, String stack, String link) {
        this.projectTitle = title;
        this.problemStatement = problem;
        this.objectives = objectives;
        this.technologyStack = stack;
        this.documentationLink = link;
        this.status = SubmissionStatus.PENDING_ANALYSIS;
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(SubmissionStatus s) {
        this.status = s;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getPodLead() {
        return podLead;
    }

    public CohortCriteria getCriteria() {
        return criteria;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public String getObjectives() {
        return objectives;
    }

    public String getTechnologyStack() {
        return technologyStack;
    }

    public String getDocumentationLink() {
        return documentationLink;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
