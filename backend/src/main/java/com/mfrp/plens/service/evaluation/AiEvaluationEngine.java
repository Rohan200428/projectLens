package com.mfrp.plens.service.evaluation;

import com.mfrp.plens.model.CohortCriteria;
import com.mfrp.plens.model.OverlapLevel;
import com.mfrp.plens.model.Submission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Primary
public class AiEvaluationEngine implements ProjectEvaluationEngine {

    private final RuleBasedEvaluationEngine fallback;
    private final RestClient restClient;
    private final boolean enabled;
    private final String apiUrl;
    private final String apiKey;
    private final String model;

    public AiEvaluationEngine(
            RuleBasedEvaluationEngine fallback,
            @Value("${projectlens.ai.enabled:false}") boolean enabled,
            @Value("${projectlens.ai.url:}") String apiUrl,
            @Value("${projectlens.ai.api-key:}") String apiKey,
            @Value("${projectlens.ai.model:}") String model) {

        this.fallback = fallback;
        this.enabled = enabled;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public ProjectEvaluationResult evaluate(
            Submission submission,
            CohortCriteria criteria,
            List<Submission> previousSubmissions) {

        if (!isAiConfigured()) {
            return fallback.evaluate(
                    submission,
                    criteria,
                    previousSubmissions);
        }

        try {
            Map<String, Object> requestBody = buildRequestBody(
                    submission,
                    criteria,
                    previousSubmissions);

            Map<?, ?> response = restClient
                    .post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return convertAiResponse(response);

        } catch (Exception exception) {
            return fallback.evaluate(
                    submission,
                    criteria,
                    previousSubmissions);
        }
    }

    private boolean isAiConfigured() {
        return enabled
                && apiUrl != null
                && !apiUrl.isBlank()
                && apiKey != null
                && !apiKey.isBlank();
    }

    private Map<String, Object> buildRequestBody(
            Submission submission,
            CohortCriteria criteria,
            List<Submission> previousSubmissions) {

        Map<String, Object> request = new LinkedHashMap<>();

        request.put("model", model);
        request.put(
                "prompt",
                buildPrompt(
                        submission,
                        criteria,
                        previousSubmissions));
        request.put("projectTitle", submission.getProjectTitle());
        request.put("problemStatement", submission.getProblemStatement());
        request.put("objectives", submission.getObjectives());
        request.put("technologyStack", submission.getTechnologyStack());
        request.put("documentationLink", submission.getDocumentationLink());
        request.put("cohortTheme", criteria.getTheme());
        request.put("learningObjectives", criteria.getLearningObjectives());
        request.put("evaluationCriteria", criteria.getEvaluationCriteria());

        return request;
    }

    private String buildPrompt(
            Submission submission,
            CohortCriteria criteria,
            List<Submission> previousSubmissions) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are the AI evaluation engine for ProjectLens.

                Evaluate the submitted project idea against the predefined cohort criteria.

                Evaluate:
                1. Alignment with the cohort theme.
                2. Alignment with the learning objectives.
                3. Compliance with the evaluation criteria.
                4. Strength of the problem statement.
                5. Clarity of the objectives.
                6. Suitability of the technology stack.
                7. Potential overlap with other project ideas.

                Return:
                alignmentScore: Integer from 0 to 100.
                matchedCriteria: Criteria satisfied by the project.
                missingCriteria: Criteria not sufficiently satisfied.
                overlapLevel: NONE, LOW, MEDIUM or HIGH.
                overlapFlag: true or false.
                analysisSummary: Concise explanation.

                Do not invent information.
                Do not create criteria that were not provided.

                """);

        prompt.append("\n--- COHORT INFORMATION ---\n");
        prompt.append("Theme: ")
                .append(criteria.getTheme())
                .append("\n");

        prompt.append("Learning Objectives: ")
                .append(criteria.getLearningObjectives())
                .append("\n");

        prompt.append("Evaluation Criteria: ")
                .append(criteria.getEvaluationCriteria())
                .append("\n");

        prompt.append("\n--- PROJECT SUBMISSION ---\n");

        prompt.append("Project Title: ")
                .append(submission.getProjectTitle())
                .append("\n");

        prompt.append("Problem Statement: ")
                .append(submission.getProblemStatement())
                .append("\n");

        prompt.append("Objectives: ")
                .append(submission.getObjectives())
                .append("\n");

        prompt.append("Technology Stack: ")
                .append(submission.getTechnologyStack())
                .append("\n");

        prompt.append("Documentation Link: ")
                .append(submission.getDocumentationLink())
                .append("\n");

        prompt.append("\n--- PREVIOUS PROJECT IDEAS ---\n");

        if (previousSubmissions == null || previousSubmissions.isEmpty()) {
            prompt.append("No previous submissions available.\n");
        } else {
            for (Submission previous : previousSubmissions) {

                if (submission.getId() != null
                        && previous.getId() != null
                        && submission.getId().equals(previous.getId())) {
                    continue;
                }

                prompt.append("Project: ")
                        .append(previous.getProjectTitle())
                        .append("\n");

                prompt.append("Problem: ")
                        .append(previous.getProblemStatement())
                        .append("\n\n");
            }
        }

        prompt.append("""

                Return JSON:

                {
                  "alignmentScore": 0,
                  "matchedCriteria": "",
                  "missingCriteria": "",
                  "overlapLevel": "NONE",
                  "overlapFlag": false,
                  "analysisSummary": ""
                }
                """);

        return prompt.toString();
    }

    private ProjectEvaluationResult convertAiResponse(Map<?, ?> response) {

        if (response == null || response.isEmpty()) {
            throw new IllegalStateException("AI service returned an empty response.");
        }

        int alignmentScore = parseScore(
                response.get("alignmentScore"));

        String matchedCriteria = parseText(
                response.get("matchedCriteria"),
                "");

        String missingCriteria = parseText(
                response.get("missingCriteria"),
                "");

        OverlapLevel overlapLevel = parseOverlapLevel(
                response.get("overlapLevel"));

        boolean overlapFlag = parseBoolean(
                response.get("overlapFlag"),
                overlapLevel != OverlapLevel.NONE);

        String analysisSummary = parseText(
                response.get("analysisSummary"),
                "AI evaluation completed.");

        return new ProjectEvaluationResult(
                clampScore(alignmentScore),
                matchedCriteria,
                missingCriteria,
                overlapLevel,
                overlapFlag,
                analysisSummary);
    }

    private int parseScore(Object value) {

        if (value == null) {
            return 0;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return Integer.parseInt(
                    String.valueOf(value).trim());
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private String parseText(
            Object value,
            String defaultValue) {

        if (value == null) {
            return defaultValue;
        }

        if (value instanceof List<?> list) {

            List<String> values = new ArrayList<>();

            for (Object item : list) {
                if (item != null) {
                    values.add(String.valueOf(item));
                }
            }

            return String.join(", ", values);
        }

        String text = String.valueOf(value).trim();

        return text.isEmpty()
                ? defaultValue
                : text;
    }

    private OverlapLevel parseOverlapLevel(Object value) {

        if (value == null) {
            return OverlapLevel.NONE;
        }

        try {
            return OverlapLevel.valueOf(
                    String.valueOf(value)
                            .trim()
                            .toUpperCase());
        } catch (IllegalArgumentException exception) {
            return OverlapLevel.NONE;
        }
    }

    private boolean parseBoolean(
            Object value,
            boolean defaultValue) {

        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        String text = String.valueOf(value)
                .trim()
                .toLowerCase();

        if ("true".equals(text)) {
            return true;
        }

        if ("false".equals(text)) {
            return false;
        }

        return defaultValue;
    }

    private int clampScore(int score) {
        return Math.max(0, Math.min(100, score));
    }
}
