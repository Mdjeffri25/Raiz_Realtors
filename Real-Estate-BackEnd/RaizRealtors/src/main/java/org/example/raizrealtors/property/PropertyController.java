package org.example.raizrealtors.property;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PropertyController {

    private final ProjectRepository projectRepository;
    private final BuildingRepository buildingRepository;

    // =========================
    // GET ALL PROJECTS
    // =========================
    @GetMapping("/projects")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<List<Project>> getAllProjects() {

        return ResponseEntity.ok(
                projectRepository.findAll()
        );
    }

    // =========================
    // GET ALL BUILDINGS
    // =========================
//    @GetMapping("/buildings")
//    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
//    public ResponseEntity<List<Building>> getAllBuildings() {
//
//        return ResponseEntity.ok(
//                buildingRepository.findAll()
//        );
//    }

    // CREATE PROJECT
    @PostMapping("/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Project> createProject(
            @RequestBody Project project) {

        return ResponseEntity.ok(
                projectRepository.save(project)
        );
    }
}