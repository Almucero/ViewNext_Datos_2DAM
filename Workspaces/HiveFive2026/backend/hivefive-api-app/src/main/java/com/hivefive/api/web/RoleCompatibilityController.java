package com.hivefive.api.web;

import com.hivefive.role.service.RoleService;
import com.hivefive.role.web.dto.RoleDto;
import com.hivefive.role.web.dto.RolePayload;
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
public class RoleCompatibilityController {

    private final RoleService roleService;

    public RoleCompatibilityController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/roles/get-all")
    public Map<String, List<RoleDto>> getAllRoles() {
        return Map.of("Role", roleService.getAllRoles());
    }

    @GetMapping("/roles/get/{id}")
    public Map<String, List<RoleDto>> getRoleById(@PathVariable("id") Long id) {
        return Map.of("Role", List.of(roleService.getRoleById(id)));
    }

    @PostMapping("/roles/create")
    public ResponseEntity<Map<String, List<RoleDto>>> createRole(@RequestBody RolePayload payload) {
        RoleDto created = roleService.createRole(payload.Role().get(0));
        return ResponseEntity.ok(Map.of("Role", List.of(created)));
    }

    @PutMapping("/roles/update")
    public ResponseEntity<Map<String, List<RoleDto>>> updateRole(@RequestBody RolePayload payload) {
        RoleDto updated = roleService.updateRole(payload.Role().get(0));
        return ResponseEntity.ok(Map.of("Role", List.of(updated)));
    }

    @DeleteMapping("/roles/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteRole(@PathVariable("id") Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
