package com.mfrp.plens.dto;

import com.mfrp.plens.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record LoginResponse(String token, UserResponse user) {
        public LoginResponse(String token, UserResponse user) {
            this.token = token;
            this.user = user;
        }
    }

    public record UserResponse(Long id, String name, String email, Role role, String podName) {
    }
}
