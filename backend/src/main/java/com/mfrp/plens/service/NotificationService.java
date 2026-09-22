package com.mfrp.plens.service;

import com.mfrp.plens.dto.DashboardDtos;
import com.mfrp.plens.model.*;
import com.mfrp.plens.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;
    private final UserRepository users;

    public NotificationService(NotificationRepository repo, UserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<DashboardDtos.NotificationResponse> forUser(User u) {
        return repo.findByUserIdOrderByCreatedAtDesc(u.getId()).stream().map(
                n -> new DashboardDtos.NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void markRead(Long id, User u) {
        repo.findById(id).filter(n -> n.getUser().getId().equals(u.getId())).ifPresent(n -> {
            n.markRead();
            repo.save(n);
        });
    }

    public void notify(User u, String message) {
        repo.save(new Notification(u, message));
    }
}
