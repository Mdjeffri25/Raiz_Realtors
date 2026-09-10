package org.example.raizrealtors.property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UnitRequest(
        @NotBlank String unitNumber,
        @NotBlank String type,
        @NotNull BigDecimal price,
        @NotNull UnitStatus status,
        @NotNull Long buildingId
) {
}