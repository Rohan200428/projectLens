package com.mfrp.plens.service;
import com.mfrp.plens.dto.AuthDtos; import com.mfrp.plens.model.User; import com.mfrp.plens.repository.UserRepository; import com.mfrp.plens.security.JwtService; import org.springframework.security.authentication.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class AuthService {private final AuthenticationManager auth;private final UserRepository users;private final JwtService jwt;public AuthService(AuthenticationManager auth,UserRepository users,JwtService jwt){this.auth=auth;this.users=users;this.jwt=jwt;}
 @Transactional(readOnly=true) public AuthDtos.LoginResponse login(AuthDtos.LoginRequest r){auth.authenticate(new UsernamePasswordAuthenticationToken(r.email(),r.password()));User u=users.findByEmailIgnoreCase(r.email()).orElseThrow();return new AuthDtos.LoginResponse(jwt.generate(u),toUser(u));}
 public AuthDtos.UserResponse toUser(User u){return new AuthDtos.UserResponse(u.getId(),u.getName(),u.getEmail(),u.getRole(),u.getPodName());}
}
