package org.example.raizrealtors.property;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitRepository unitRepository;
    private final BuildingRepository buildingRepository;

    // GET ALL UNITS
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<List<Unit>> getAllUnits() {

        return ResponseEntity.ok(
                unitRepository.findAll()
        );
    }

    // GET UNIT BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES','BACK_OFFICE','AUDITOR')")
    public ResponseEntity<Unit> getUnitById(
            @PathVariable Long id) {

        Unit unit = unitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unit not found"));

        return ResponseEntity.ok(unit);
    }

    // CREATE UNIT
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','BACK_OFFICE')")
    public ResponseEntity<Unit> createUnit(
            @Valid @RequestBody UnitRequest request) {

        Building building = buildingRepository.findById(request.buildingId())
                .orElseThrow(() ->
                        new RuntimeException("Building not found"));

        Unit unit = Unit.builder()
                .unitNumber(request.unitNumber())
                .type(request.type())
                .price(request.price())
                .status(request.status())
                .building(building)
                .build();

        return ResponseEntity.ok(
                unitRepository.save(unit)
        );
    }

    // UPDATE UNIT
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','BACK_OFFICE')")
    public ResponseEntity<Unit> updateUnit(
            @PathVariable Long id,
            @Valid @RequestBody UnitRequest request) {

        Unit existingUnit = unitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Unit not found"));

        Building building = buildingRepository.findById(request.buildingId())
                .orElseThrow(() ->
                        new RuntimeException("Building not found"));

        existingUnit.setUnitNumber(request.unitNumber());
        existingUnit.setType(request.type());
        existingUnit.setPrice(request.price());
        existingUnit.setStatus(request.status());
        existingUnit.setBuilding(building);

        return ResponseEntity.ok(
                unitRepository.save(existingUnit)
        );
    }

    // DELETE UNIT
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUnit(
            @PathVariable Long id) {

        if (!unitRepository.existsById(id)) {
            throw new RuntimeException("Unit not found");
        }

        unitRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}