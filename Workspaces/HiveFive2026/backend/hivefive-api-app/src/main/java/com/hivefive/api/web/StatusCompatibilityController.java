package com.hivefive.api.web;

import com.hivefive.status.service.StatusService;
import com.hivefive.status.web.dto.StatusDto;
import com.hivefive.status.web.dto.StatusPayload;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class StatusCompatibilityController {

    private final StatusService statusService;

    public StatusCompatibilityController(StatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/status/get-all")
    public Map<String, List<StatusDto>> getAllStatus() {
        return Map.of("Status", statusService.getAllStatuses());
    }

    @GetMapping("/status/get/{id}")
    public Map<String, List<StatusDto>> getStatusById(@PathVariable("id") Long id) {
        return Map.of("Status", List.of(statusService.getStatusById(id)));
    }

    @PostMapping("/status/create")
    public ResponseEntity<Map<String, List<StatusDto>>> createStatus(@RequestBody StatusPayload payload) {
        StatusDto created = statusService.createStatus(payload.Status().get(0));
        return ResponseEntity.ok(Map.of("Status", List.of(created)));
    }

    @PutMapping("/status/update")
    public ResponseEntity<Map<String, List<StatusDto>>> updateStatus(@RequestBody StatusPayload payload) {
        StatusDto updated = statusService.updateStatus(payload.Status().get(0));
        return ResponseEntity.ok(Map.of("Status", List.of(updated)));
    }

    @DeleteMapping("/status/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteStatus(@PathVariable("id") Long id) {
        statusService.deleteStatus(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
