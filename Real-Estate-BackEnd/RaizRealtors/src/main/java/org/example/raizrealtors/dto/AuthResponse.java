package org.example.raizrealtors.dto;


import org.example.raizrealtors.user.Role;

public record AuthResponse(

        String token,
        Long userId,
        String name,
        String email,
        Role role
) {}
