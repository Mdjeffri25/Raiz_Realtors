package org.example.raizrealtors.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank
        String currentPassword,

        @NotBlank
        @Size(min = 6, message = "New password must contain at least 6 characters")
        String newPassword
) {
}