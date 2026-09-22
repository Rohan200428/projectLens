package com.mfrp.plens.controller;

import com.mfrp.plens.dto.DashboardDtos;
import com.mfrp.plens.model.User;
import com.mfrp.plens.repository.UserRepository;
import com.mfrp.plens.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final UserRepository users;

    public NotificationController(NotificationService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    private User current(Authentication a) {
        return users.findByEmailIgnoreCase(a.getName()).orElseThrow();
    }

    @GetMapping
    public List<DashboardDtos.NotificationResponse> list(Authentication a) {
        return service.forUser(current(a));
    }

    @PatchMapping("/{id}/read")
    public void read(@PathVariable Long id, Authentication a) {
        service.markRead(id, current(a));
    }
}
