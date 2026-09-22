package com.mfrp.plens.service;
import com.mfrp.plens.dto.DashboardDtos; import com.mfrp.plens.repository.CohortCriteriaRepository; import org.springframework.stereotype.Service;
@Service public class CriteriaService {private final CohortCriteriaRepository repo;public CriteriaService(CohortCriteriaRepository repo){this.repo=repo;}public DashboardDtos.CriteriaResponse active(){var c=repo.findFirstByActiveTrue().orElseThrow();return new DashboardDtos.CriteriaResponse(c.getId(),c.getTheme(),c.getLearningObjectives(),c.getEvaluationCriteria(),c.isActive());}}
