package com.mfrp.plens.controller;

import com.mfrp.plens.dto.AuthDtos;
import com.mfrp.plens.model.User;
import com.mfrp.plens.repository.UserRepository;
import com.mfrp.plens.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final UserRepository users;

    public AuthController(AuthService auth, UserRepository users) {
        this.auth = auth;
        this.users = users;
    }

    @PostMapping("/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest r) {
        return auth.login(r);
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse me(Authentication a) {
        User u = users.findByEmailIgnoreCase(a.getName()).orElseThrow();
        return auth.toUser(u);
    }
}
