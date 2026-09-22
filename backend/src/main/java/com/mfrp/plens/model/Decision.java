package com.mfrp.plens.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "decisions")
public class Decision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private Submission submission;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DecisionStatus status;
    @Column(columnDefinition = "TEXT")
    private String comments;
    @Column(nullable = false)
    private LocalDateTime decidedAt;

    protected Decision() {
    }

    public Decision(Submission s, User t, DecisionStatus status, String comments) {
        this.submission = s;
        this.trainer = t;
        this.status = status;
        this.comments = comments;
        this.decidedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getTrainer() {
        return trainer;
    }

    public DecisionStatus getStatus() {
        return status;
    }

    public String getComments() {
        return comments;
    }

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }
}
