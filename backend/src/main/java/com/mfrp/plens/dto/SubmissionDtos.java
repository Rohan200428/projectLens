package com.mfrp.plens.dto;

import com.mfrp.plens.model.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public final class SubmissionDtos {
    private SubmissionDtos() {
    }

    public record SubmissionRequest(@NotBlank String projectTitle, @NotBlank String problemStatement,
            @NotBlank String objectives, @NotBlank String technologyStack, String documentationLink) {
    }

    public record DecisionRequest(DecisionStatus status, String comments) {
    }

    public record EvaluationResponse(int alignmentScore, String matchedCriteria, String missingCriteria,
            OverlapLevel overlapLevel, boolean overlapFlag, String analysisSummary, LocalDateTime evaluatedAt) {
    }

    public record DecisionResponse(DecisionStatus status, String comments, String trainerName,
            LocalDateTime decidedAt) {
    }

    public record SubmissionResponse(Long id, String podName, String podLeadName, String projectTitle,
            String problemStatement, String objectives, String technologyStack, String documentationLink,
            SubmissionStatus status, LocalDateTime submittedAt, EvaluationResponse evaluation,
            DecisionResponse decision) {
    }
}
