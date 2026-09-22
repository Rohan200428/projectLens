package com.mfrp.plens.service.evaluation;

import com.mfrp.plens.model.*;
import java.util.List;

public interface ProjectEvaluationEngine {
    ProjectEvaluationResult evaluate(Submission submission, CohortCriteria criteria, List<Submission> previous);
}
