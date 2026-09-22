package com.mfrp.plens.repository;

import com.mfrp.plens.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
	List<Submission> findAllByOrderBySubmittedAtDesc();

	List<Submission> findByPodLeadIdOrderBySubmittedAtDesc(Long podLeadId);

	List<Submission> findByPodLeadPodNameOrderBySubmittedAtDesc(String podName);

	List<Submission> findByStatusInOrderBySubmittedAtDesc(List<SubmissionStatus> statuses);
}
