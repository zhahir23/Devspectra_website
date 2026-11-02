package com.devspectrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private String role;
    private String division;

    public AuthResponse(String token, String email, String name, String role, String division) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
        this.division = division;
    }
}