package com.mfrp.plens.service;

import com.mfrp.plens.dto.*;
import com.mfrp.plens.model.*;
import com.mfrp.plens.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class DashboardService {
    private final SubmissionRepository submissions;
    private final EvaluationRepository evaluations;
    private final SubmissionService submissionService;

    public DashboardService(SubmissionRepository submissions, EvaluationRepository evaluations,
            SubmissionService submissionService) {
        this.submissions = submissions;
        this.evaluations = evaluations;
        this.submissionService = submissionService;
    }

    @Transactional(readOnly = true)
    public DashboardDtos.TrainerDashboard trainer() {
        var all = submissions.findAll();
        var evals = evaluations.findAll();
        double avg = evals.stream().mapToInt(Evaluation::getAlignmentScore).average().orElse(0);
        long review = all.stream().filter(s -> s.getStatus() == SubmissionStatus.PENDING_TRAINER_REVIEW).count();
        long revision = all.stream().filter(s -> s.getStatus() == SubmissionStatus.NEEDS_REVISION).count();
        long overlap = evals.stream().filter(Evaluation::isOverlapFlag).count();
        return new DashboardDtos.TrainerDashboard(all.size(), review, revision, Math.round(avg * 10) / 10.0, overlap,
                submissionService.listForTrainer());
    }

    @Transactional(readOnly = true)
    public DashboardDtos.PodLeadDashboard lead(User u) {
        var list = u.getRole() == Role.POD_LEAD ? submissionService.listForLead(u)
                : submissionService.listForPod(u.getPodName());
        long revision = list.stream().filter(s -> s.status() == SubmissionStatus.NEEDS_REVISION).count();
        long pending = list.stream().filter(s -> s.status() == SubmissionStatus.PENDING_TRAINER_REVIEW).count();
        long reviewed = list.stream().filter(s -> s.status() == SubmissionStatus.REVIEWED).count();
        var latest = list.isEmpty() ? null : list.get(0);
        return new DashboardDtos.PodLeadDashboard(list.size(), revision, pending, reviewed,
                latest == null || latest.evaluation() == null ? 0 : latest.evaluation().alignmentScore(),
                latest == null ? "—" : latest.status().name(), list.stream().limit(5).toList());
    }
}
