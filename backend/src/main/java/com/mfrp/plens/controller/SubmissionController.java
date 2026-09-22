package com.mfrp.plens.controller;

import com.mfrp.plens.dto.SubmissionDtos;
import com.mfrp.plens.model.User;
import com.mfrp.plens.repository.UserRepository;
import com.mfrp.plens.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService service;
    private final UserRepository users;

    public SubmissionController(SubmissionService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    private User current(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow();
    }

    @GetMapping
    public List<SubmissionDtos.SubmissionResponse> list(Authentication a) {
        User u = current(a);
        return switch (u.getRole()) {
            case TRAINER -> service.listForTrainer();
            case POD_LEAD -> service.listForLead(u);
            case POD_MEMBER -> service.listForPod(u.getPodName());
        };
    }

    @GetMapping("/{id}")
    public SubmissionDtos.SubmissionResponse get(@PathVariable Long id, Authentication a) {
        return service.get(id, current(a));
    }

    @PostMapping
    public SubmissionDtos.SubmissionResponse create(@Valid @RequestBody SubmissionDtos.SubmissionRequest r,
            Authentication a) {
        return service.create(r, current(a));
    }

    @PutMapping("/{id}")
    public SubmissionDtos.SubmissionResponse revise(@PathVariable Long id,
            @Valid @RequestBody SubmissionDtos.SubmissionRequest r, Authentication a) {
        return service.revise(id, r, current(a));
    }

    @PostMapping("/{id}/decision")
    public SubmissionDtos.SubmissionResponse decide(@PathVariable Long id,
            @RequestBody SubmissionDtos.DecisionRequest r, Authentication a) {
        return service.decide(id, r, current(a));
    }
}
