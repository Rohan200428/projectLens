package com.mfrp.plens.service.evaluation;

import com.mfrp.plens.model.OverlapLevel;

public record ProjectEvaluationResult(int alignmentScore, String matchedCriteria, String missingCriteria,
        OverlapLevel overlapLevel, boolean overlapFlag, String analysisSummary) {
}
