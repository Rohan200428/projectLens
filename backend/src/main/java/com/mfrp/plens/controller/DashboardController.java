package com.mfrp.plens.controller;

import com.mfrp.plens.dto.DashboardDtos;
import com.mfrp.plens.dto.DashboardDtos.PodLeadDashboard;
import com.mfrp.plens.dto.DashboardDtos.TrainerDashboard;
import com.mfrp.plens.model.User;
import com.mfrp.plens.repository.UserRepository;
import com.mfrp.plens.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService service;
    private final UserRepository users;

    public DashboardController(DashboardService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    @GetMapping("/trainer/dashboard")
    public TrainerDashboard trainer() {
        return service.trainer();
    }

    @GetMapping("/pod-lead/dashboard")
    public PodLeadDashboard lead(Authentication a) {
        User u = users.findByEmailIgnoreCase(a.getName()).orElseThrow();
        return service.lead(u);
    }
}
