package org.example.raizrealtors.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeadRequest {

    @NotBlank(message = "Lead name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @Email(message = "Invalid email address")
    private String email;

    private LeadStage stage;

    private String notes;

    private LocalDate followUpDate;

    private Long assignedUserId;
}