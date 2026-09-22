package com.mfrp.plens.exception;

import com.mfrp.plens.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiError> badCredentials(BadCredentialsException e, HttpServletRequest r) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid email or password.", r);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
        String m = e.getBindingResult().getFieldErrors().stream().findFirst()
                .map(x -> x.getField() + ": " + x.getDefaultMessage()).orElse("Validation failed.");
        return error(HttpStatus.BAD_REQUEST, m, r);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException e, HttpServletRequest r) {
        return error(HttpStatus.valueOf(e.getStatusCode().value()), e.getReason(), r);
    }

    private ResponseEntity<ApiError> error(HttpStatus s, String m, HttpServletRequest r) {
        return ResponseEntity.status(s)
                .body(new ApiError(Instant.now(), s.value(), s.getReasonPhrase(), m, r.getRequestURI()));
    }
}
