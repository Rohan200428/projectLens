package com.mfrp.plens.config;

import com.mfrp.plens.model.CohortCriteria;
import com.mfrp.plens.model.Role;
import com.mfrp.plens.model.User;
import com.mfrp.plens.repository.CohortCriteriaRepository;
import com.mfrp.plens.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner seed(
                        UserRepository userRepository,
                        CohortCriteriaRepository criteriaRepository,
                        PasswordEncoder passwordEncoder) {

                return args -> {

                        // Create demo users only if no users exist
                        if (userRepository.count() == 0) {

                                User trainer = new User(
                                                "Priya Sharma",
                                                "trainer@projectlens.local",
                                                passwordEncoder.encode("Trainer@123"),
                                                Role.TRAINER,
                                                null);

                                User podLeadAlpha = new User(
                                                "Aarav Mehta",
                                                "alpha@projectlens.local",
                                                passwordEncoder.encode("PodLead@123"),
                                                Role.POD_LEAD,
                                                "Pod Alpha");

                                User podLeadBeta = new User(
                                                "Riya Kapoor",
                                                "beta@projectlens.local",
                                                passwordEncoder.encode("PodLead@123"),
                                                Role.POD_LEAD,
                                                "Pod Beta");

                                User podMember = new User(
                                                "Kabir Shah",
                                                "alpha.member@projectlens.local",
                                                passwordEncoder.encode("Member@123"),
                                                Role.POD_MEMBER,
                                                "Pod Alpha");

                                userRepository.save(trainer);
                                userRepository.save(podLeadAlpha);
                                userRepository.save(podLeadBeta);
                                userRepository.save(podMember);
                        }

                        // Create predefined cohort criteria
                        if (criteriaRepository.count() == 0) {

                                CohortCriteria criteria = new CohortCriteria(
                                                "AI-Assisted Engineering",
                                                "Build a practical software solution that demonstrates meaningful use of AI and automation.",
                                                "Use Java/Spring Boot, Angular, REST APIs, database persistence, testing, and a meaningful AI-assisted capability.",
                                                true);

                                criteriaRepository.save(criteria);
                        }
                };
        }
}
