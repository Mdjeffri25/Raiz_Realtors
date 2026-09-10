package org.example.raizrealtors.dto;


import jakarta.validation.constraints.*;
import org.example.raizrealtors.user.Role;

public record RegisterRequest(

        @NotBlank
        String name,

        @Email
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 6)
        String password,

        @NotNull
        Role role
) {}
