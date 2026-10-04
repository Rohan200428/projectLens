package com.mfrp.plens.repository;

import com.mfrp.plens.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findFirstByRole(Role role);

    List<User> findAllByRole(Role role);

    List<User> findAllByRoleAndPodName(Role role, String podName);
}
