package com.mfrp.plens.service.evaluation;

import com.mfrp.plens.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class RuleBasedEvaluationEngine implements ProjectEvaluationEngine {
    private final double overlapThreshold;

    public RuleBasedEvaluationEngine(@Value("${projectlens.evaluation.overlap-threshold}") double overlapThreshold) {
        this.overlapThreshold = overlapThreshold;
    }

    @Override
    public ProjectEvaluationResult evaluate(Submission s, CohortCriteria c, List<Submission> previous) {
        String text = (s.getProjectTitle() + " " + s.getProblemStatement() + " " + s.getObjectives() + " "
                + s.getTechnologyStack()).toLowerCase();
        List<String> checks = List.of("java", "spring boot", "angular", "rest", "api", "database", "test", "testing",
                "ai", "automation");
        List<String> matched = checks.stream().filter(text::contains).toList();
        List<String> missing = checks.stream().filter(x -> !text.contains(x)).toList();
        int score = (int) Math.round((matched.size() * 100.0) / checks.size());
        double best = previous.stream().mapToDouble(p -> similarity(s.getProjectTitle() + " " + s.getProblemStatement(),
                p.getProjectTitle() + " " + p.getProblemStatement())).max().orElse(0);
        OverlapLevel level = best >= 0.75 ? OverlapLevel.HIGH
                : best >= 0.65 ? OverlapLevel.MEDIUM : best >= overlapThreshold ? OverlapLevel.LOW : OverlapLevel.NONE;
        boolean flag = level != OverlapLevel.NONE;
        String summary = score >= 70
                ? "The idea meets the minimum alignment threshold based on the configured criteria."
                : "The idea needs improvement before it can be forwarded to the trainer.";
        return new ProjectEvaluationResult(Math.min(score, 100), String.join(", ", matched), String.join(", ", missing),
                level, flag, summary);
    }

    private double similarity(String a, String b) {
        Set<String> x = words(a), y = words(b);
        if (x.isEmpty() || y.isEmpty())
            return 0;
        Set<String> i = new HashSet<>(x);
        i.retainAll(y);
        Set<String> u = new HashSet<>(x);
        u.addAll(y);
        return i.size() / (double) u.size();
    }

    private Set<String> words(String s) {
        return Arrays.stream(s.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+")).filter(w -> w.length() > 2)
                .collect(Collectors.toSet());
    }
}
