package com.hivefive.api.web;

import com.hivefive.checklist.service.ChecklistItemService;
import com.hivefive.checklist.web.dto.ChecklistItemDto;
import com.hivefive.checklist.web.dto.ChecklistItemPayload;
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
public class ChecklistItemCompatibilityController {

    private final ChecklistItemService checklistItemService;

    public ChecklistItemCompatibilityController(ChecklistItemService checklistItemService) {
        this.checklistItemService = checklistItemService;
    }

    @GetMapping("/checklist-items/get-all")
    public Map<String, List<ChecklistItemDto>> getAllChecklistItems() {
        return Map.of("ChecklistItem", checklistItemService.getAllChecklistItems());
    }

    @GetMapping("/checklist-items/get/{id}")
    public Map<String, List<ChecklistItemDto>> getChecklistItemById(@PathVariable("id") Long id) {
        return Map.of("ChecklistItem", List.of(checklistItemService.getChecklistItemById(id)));
    }

    @PostMapping("/checklist-items/create")
    public ResponseEntity<Map<String, List<ChecklistItemDto>>> createChecklistItem(
            @RequestBody ChecklistItemPayload payload) {
        ChecklistItemDto created = checklistItemService.createChecklistItem(payload.ChecklistItem().get(0));
        return ResponseEntity.ok(Map.of("ChecklistItem", List.of(created)));
    }

    @PutMapping("/checklist-items/update")
    public ResponseEntity<Map<String, List<ChecklistItemDto>>> updateChecklistItem(
            @RequestBody ChecklistItemPayload payload) {
        ChecklistItemDto updated = checklistItemService.updateChecklistItem(payload.ChecklistItem().get(0));
        return ResponseEntity.ok(Map.of("ChecklistItem", List.of(updated)));
    }

    @DeleteMapping("/checklist-items/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteChecklistItem(@PathVariable("id") Long id) {
        checklistItemService.deleteChecklistItem(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
