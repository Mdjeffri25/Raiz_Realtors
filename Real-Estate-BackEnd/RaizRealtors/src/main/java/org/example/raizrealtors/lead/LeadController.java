package org.example.raizrealtors.lead;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<List<Lead>> getAllLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<Lead> getLead(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public ResponseEntity<Lead> createLead(
            @Valid @RequestBody LeadRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                leadService.createLead(
                        request,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES')")
    public ResponseEntity<Lead> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                leadService.updateLead(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLead(
            @PathVariable Long id,
            Authentication authentication) {

        leadService.deleteLead(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}