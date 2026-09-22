package com.mfrp.plens.repository;

import com.mfrp.plens.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
    Optional<Decision> findBySubmissionId(Long submissionId);
}
