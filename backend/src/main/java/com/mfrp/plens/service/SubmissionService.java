package com.mfrp.plens.service;

import com.mfrp.plens.dto.SubmissionDtos;
import com.mfrp.plens.model.*;
import com.mfrp.plens.repository.*;
import com.mfrp.plens.service.evaluation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class SubmissionService {
	private final SubmissionRepository submissions;
	private final EvaluationRepository evaluations;
	private final DecisionRepository decisions;
	private final CohortCriteriaRepository criteria;
	private final UserRepository users;
	private final NotificationService notifications;
	private final ProjectEvaluationEngine engine;
	private final int threshold;

	public SubmissionService(SubmissionRepository submissions, EvaluationRepository evaluations,
			DecisionRepository decisions, CohortCriteriaRepository criteria, UserRepository users,
			NotificationService notifications, ProjectEvaluationEngine engine,
			@Value("${projectlens.evaluation.threshold}") int threshold) {
		this.submissions = submissions;
		this.evaluations = evaluations;
		this.decisions = decisions;
		this.criteria = criteria;
		this.users = users;
		this.notifications = notifications;
		this.engine = engine;
		this.threshold = threshold;
	}

	@Transactional

	public SubmissionDtos.SubmissionResponse create(SubmissionDtos.SubmissionRequest r, User lead) {
		if (lead.getRole() != Role.POD_LEAD)
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only a Pod Lead can submit an idea.");
		CohortCriteria c = criteria.findFirstByActiveTrue()
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Active cohort criteria not configured."));
		Submission s = submissions.save(new Submission(lead, c, r.projectTitle(), r.problemStatement(),
				r.objectives(), r.technologyStack(), r.documentationLink()));
		evaluate(s);
		return get(s.getId(), lead);
	}

	@Transactional

	public SubmissionDtos.SubmissionResponse revise(Long id, SubmissionDtos.SubmissionRequest r, User lead) {
		Submission s = owned(id, lead);
		s.revise(r.projectTitle(), r.problemStatement(),
				r.objectives(), r.technologyStack(), r.documentationLink());
		evaluations.findBySubmissionId(id).ifPresent(evaluations::delete);
		decisions.findBySubmissionId(id).ifPresent(decisions::delete);
		evaluate(submissions.save(s));
		return get(id, lead);
	}

	@Transactional

	public SubmissionDtos.SubmissionResponse decide(Long id, SubmissionDtos.DecisionRequest r, User trainer) {
		if (trainer.getRole() != Role.TRAINER)
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only a Trainer can record a decision.");
		Submission s = submissions.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found."));
		if (s.getStatus() != SubmissionStatus.PENDING_TRAINER_REVIEW)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Only qualifying submissions can receive a decision.");
		if (r.status() == null)
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision status is required.");
		decisions.findBySubmissionId(id).ifPresent(decisions::delete);
		decisions.save(new Decision(s, trainer, r.status(), r.comments()));
		s.setStatus(SubmissionStatus.REVIEWED);
		submissions.save(s);
		notifications.notify(s.getPodLead(), "Trainer decision for '" + s.getProjectTitle() + "': "
				+ label(r.status()) + (r.comments() == null ? "" : " — " + r.comments()));
		return get(id, trainer);
	}

	@Transactional(readOnly = true)

	public SubmissionDtos.SubmissionResponse get(Long id, User user) {
		Submission s = submissions.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found."));
		if (user.getRole() == Role.POD_LEAD && !s.getPodLead().getId().equals(user.getId()))
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your pod submissions.");
		if (user.getRole() == Role.POD_MEMBER && !Objects.equals(user.getPodName(), s.getPodLead().getPodName()))
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view submissions from your pod.");
		return map(s);
	}

	@Transactional(readOnly = true)

	public List<SubmissionDtos.SubmissionResponse> listForTrainer() {
		return submissions.findByStatusInOrderBySubmittedAtDesc(List.of(SubmissionStatus.PENDING_TRAINER_REVIEW))
				.stream().map(this::map).toList();
	}

	@Transactional(readOnly = true)

	public List<SubmissionDtos.SubmissionResponse> listForLead(User lead) {
		return submissions.findByPodLeadIdOrderBySubmittedAtDesc(lead.getId()).stream().map(this::map).toList();
	}

	@Transactional(readOnly = true)

	public List<SubmissionDtos.SubmissionResponse> listForPod(String podName) {
		return submissions.findByPodLeadPodNameOrderBySubmittedAtDesc(podName).stream().map(this::map).toList();
	}

	private void evaluate(Submission s) {
		List<Submission> previous = submissions.findAllByOrderBySubmittedAtDesc().stream()
				.filter(x -> !x.getId().equals(s.getId())).toList();
		ProjectEvaluationResult r = engine.evaluate(s, s.getCriteria(), previous);
		evaluations.save(new Evaluation(s, r.alignmentScore(), r.matchedCriteria(),
				r.missingCriteria(), r.overlapLevel(), r.overlapFlag(), r.analysisSummary()));
		if (r.alignmentScore() >= threshold) {
			s.setStatus(SubmissionStatus.PENDING_TRAINER_REVIEW);
			notifications.notify(s.getPodLead(), "Your project idea '" + s.getProjectTitle() + "' qualified for"
					+ " trainer review with an alignment score of " + r.alignmentScore() + "%.");
		} else {
			s.setStatus(SubmissionStatus.NEEDS_REVISION);
			notifications.notify(s.getPodLead(), "Your project idea '" + s.getProjectTitle() + "' needs improvement. "
					+ "Alignment score: " + r.alignmentScore() + "%. Please revise and reupload.");
		}
		submissions.save(s);
	}

	private Submission owned(Long id, User lead) {
		Submission s = submissions.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found."));
		if (!s.getPodLead().getId().equals(lead.getId()))
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"You can only modify your pod submissions.");
		return s;
	}

	private SubmissionDtos.SubmissionResponse map(Submission s) {
		Evaluation e = evaluations.findBySubmissionId(s.getId()).orElse(null);
		Decision d = decisions.findBySubmissionId(s.getId()).orElse(null);
		var er = e == null ? null
				: new SubmissionDtos.EvaluationResponse(e.getAlignmentScore(), e.getMatchedCriteria(),
						e.getMissingCriteria(), e.getOverlapLevel(), e.isOverlapFlag(), e.getAnalysisSummary(),
						e.getEvaluatedAt());
		var dr = d == null ? null
				: new SubmissionDtos.DecisionResponse(d.getStatus(), d.getComments(), d.getTrainer().getName(),
						d.getDecidedAt());
		return new SubmissionDtos.SubmissionResponse(s.getId(), s.getPodLead().getPodName(), s.getPodLead().getName(),
				s.getProjectTitle(), s.getProblemStatement(), s.getObjectives(), s.getTechnologyStack(),
				s.getDocumentationLink(), s.getStatus(), s.getSubmittedAt(), er, dr);
	}

	private String label(DecisionStatus s) {
		return switch (s) {
			case APPROVED -> "Approved";
			case NEEDS_REVISION -> "Needs Revision";
			case REJECTED -> "Rejected";
		};
	}
}
