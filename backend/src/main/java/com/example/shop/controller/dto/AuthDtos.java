package com.example.shop.controller.dto;

public class AuthDtos {
    public static class RegisterRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String password;
    }
    public static class LoginRequest {
        public String email;
        public String password;
    }
    public static class AuthResponse {
        public String token;
        public String role;
        public Long userId;
        public String firstName;
        public String lastName;
    }
}
