package org.example.raizrealtors.property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BuildingRequest(
        @NotBlank String name,
        @NotNull Long projectId
) {
}