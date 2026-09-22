package com.mfrp.plens.repository;

import com.mfrp.plens.model.CohortCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CohortCriteriaRepository extends JpaRepository<CohortCriteria, Long> {
    Optional<CohortCriteria> findFirstByActiveTrue();
}
