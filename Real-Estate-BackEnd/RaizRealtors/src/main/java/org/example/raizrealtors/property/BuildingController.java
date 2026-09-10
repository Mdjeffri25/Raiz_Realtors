package org.example.raizrealtors.property;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.raizrealtors.property.Project;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingRepository buildingRepository;
    private final ProjectRepository projectRepository;

    // GET ALL BUILDINGS
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<List<Building>> getAllBuildings() {
        return ResponseEntity.ok(buildingRepository.findAll());
    }

    // CREATE BUILDING
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','BACK_OFFICE')")
    public ResponseEntity<Building> createBuilding(
            @Valid @RequestBody BuildingRequest request) {

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        Building building = Building.builder()
                .name(request.name())
                .project(project)
                .build();

        return ResponseEntity.ok(
                buildingRepository.save(building)
        );
    }

    // UPDATE BUILDING
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BACK_OFFICE')")
    public ResponseEntity<Building> updateBuilding(
            @PathVariable Long id,
            @Valid @RequestBody BuildingRequest request) {

        Building existing = buildingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Building not found"));

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        existing.setName(request.name());
        existing.setProject(project);

        return ResponseEntity.ok(
                buildingRepository.save(existing)
        );
    }

    // DELETE BUILDING
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBuilding(
            @PathVariable Long id) {

        if (!buildingRepository.existsById(id)) {
            throw new RuntimeException("Building not found");
        }

        buildingRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}