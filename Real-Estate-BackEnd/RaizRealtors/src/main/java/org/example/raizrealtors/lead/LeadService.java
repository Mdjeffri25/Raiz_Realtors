package org.example.raizrealtors.lead;

import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.audit.AuditService;
import org.example.raizrealtors.user.User;
import org.example.raizrealtors.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    public Lead getLeadById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Lead not found with id: " + id));
    }

    @Transactional
    public Lead createLead(LeadRequest request, String userEmail) {

        Lead lead = new Lead();

        lead.setName(request.getName());
        lead.setPhone(request.getPhone());
        lead.setEmail(request.getEmail());
        lead.setStage(
                request.getStage() != null
                        ? request.getStage()
                        : LeadStage.NEW
        );
        lead.setNotes(request.getNotes());
        lead.setFollowUpDate(request.getFollowUpDate());

        if (request.getAssignedUserId() != null) {

            User assignedUser = userRepository.findById(
                    request.getAssignedUserId()
            ).orElseThrow(() ->
                    new RuntimeException("Assigned user not found"));

            lead.setAssignedUser(assignedUser);
        }

        Lead savedLead = leadRepository.save(lead);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        auditService.log(
                currentUser,
                "CREATED",
                "LEAD",
                savedLead.getId(),
                "Created lead: " + savedLead.getName()
        );

        return savedLead;
    }

    @Transactional
    public Lead updateLead(
            Long id,
            LeadRequest request,
            String userEmail) {

        Lead lead = getLeadById(id);

        lead.setName(request.getName());
        lead.setPhone(request.getPhone());
        lead.setEmail(request.getEmail());

        if (request.getStage() != null) {
            lead.setStage(request.getStage());
        }

        lead.setNotes(request.getNotes());
        lead.setFollowUpDate(request.getFollowUpDate());

        if (request.getAssignedUserId() != null) {

            User assignedUser = userRepository.findById(
                    request.getAssignedUserId()
            ).orElseThrow(() ->
                    new RuntimeException("Assigned user not found"));

            lead.setAssignedUser(assignedUser);

        } else {
            lead.setAssignedUser(null);
        }

        Lead updatedLead = leadRepository.save(lead);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        auditService.log(
                currentUser,
                "UPDATED",
                "LEAD",
                updatedLead.getId(),
                "Updated lead: " + updatedLead.getName()
        );

        return updatedLead;
    }

    @Transactional
    public void deleteLead(Long id, String userEmail) {

        Lead lead = getLeadById(id);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String leadName = lead.getName();

        leadRepository.delete(lead);

        auditService.log(
                currentUser,
                "DELETED",
                "LEAD",
                id,
                "Deleted lead: " + leadName
        );
    }
}