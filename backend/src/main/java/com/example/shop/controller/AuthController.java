package com.example.shop.controller;

import com.example.shop.controller.dto.AuthDtos;
import com.example.shop.entity.User;
import com.example.shop.repository.UserRepository;
import com.example.shop.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final UserRepository userRepository;

    public AuthController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDtos.RegisterRequest req) {
        try {
            if (req == null || req.email == null || req.email.isBlank() || req.password == null || req.password.isBlank()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Email et mot de passe requis"));
            }
            if (userRepository.existsByEmail(req.email)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Un compte existe déjà avec cet email"));
            }
            User u = userService.registerClient(req.firstName, req.lastName, req.email, req.password);
            String token = userService.login(req.email, req.password);
            AuthDtos.AuthResponse res = new AuthDtos.AuthResponse();
            res.token = token;
            res.role = u.getRole().name();
            res.userId = u.getId();
            res.firstName = u.getFirstName();
            res.lastName = u.getLastName();
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Erreur lors de l'inscription: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest req) {
        try {
            String token = userService.login(req.email, req.password);
            User u = userRepository.findByEmail(req.email).orElseThrow();
            AuthDtos.AuthResponse res = new AuthDtos.AuthResponse();
            res.token = token;
            res.role = u.getRole().name();
            res.userId = u.getId();
            res.firstName = u.getFirstName();
            res.lastName = u.getLastName();
            return ResponseEntity.ok(res);
        } catch (Exception ex) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Identifiants invalides"));
        }
    }
}
