package com.mfrp.plens.controller;

import com.mfrp.plens.dto.DashboardDtos;
import com.mfrp.plens.service.CriteriaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/criteria")
public class CriteriaController {
    private final CriteriaService service;

    public CriteriaController(CriteriaService service) {
        this.service = service;
    }

    @GetMapping
    public DashboardDtos.CriteriaResponse active() {
        return service.active();
    }
}
