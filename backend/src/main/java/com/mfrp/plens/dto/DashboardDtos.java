package com.mfrp.plens.dto;

import java.util.List;

public final class DashboardDtos {
    private DashboardDtos() {
    }

    public record TrainerDashboard(long totalSubmissions, long awaitingReview, long needsRevision,
            double averageAlignment, long overlapFlags, List<SubmissionDtos.SubmissionResponse> reviewQueue) {
    }

    public record PodLeadDashboard(long mySubmissions, long needsRevision, long pendingReview, long reviewed,
            double latestScore, String latestStatus, List<SubmissionDtos.SubmissionResponse> recentSubmissions) {
    }

    public record CriteriaResponse(Long id, String theme, String learningObjectives, String evaluationCriteria,
            boolean active) {
    }

    public record NotificationResponse(Long id, String message, boolean read, java.time.LocalDateTime createdAt) {
    }
}
