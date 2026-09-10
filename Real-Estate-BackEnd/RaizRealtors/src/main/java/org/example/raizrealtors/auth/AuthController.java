package org.example.raizrealtors.auth;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.dto.AuthResponse;
import org.example.raizrealtors.dto.LoginRequest;
import org.example.raizrealtors.dto.RegisterRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}
