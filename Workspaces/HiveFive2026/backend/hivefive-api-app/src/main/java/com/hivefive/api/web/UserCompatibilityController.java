package com.hivefive.api.web;

import com.hivefive.api.service.DomainOrchestrationService;
import com.hivefive.user.service.UserService;
import com.hivefive.user.web.dto.UserDto;
import com.hivefive.user.web.dto.UserPayload;
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
public class UserCompatibilityController {

    private final UserService userService;
    private final DomainOrchestrationService domainOrchestrationService;

    public UserCompatibilityController(UserService userService, DomainOrchestrationService domainOrchestrationService) {
        this.userService = userService;
        this.domainOrchestrationService = domainOrchestrationService;
    }

    @GetMapping("/users/get-all")
    public Map<String, List<UserDto>> getAllUsers() {
        return Map.of("User", userService.getAllUsers());
    }

    @GetMapping("/users/get/{id}")
    public Map<String, List<UserDto>> getUserById(@PathVariable("id") Long id) {
        return Map.of("User", List.of(userService.getUserById(id)));
    }

    @PostMapping("/users/create")
    public ResponseEntity<Map<String, List<UserDto>>> createUser(@RequestBody UserPayload payload) {
        UserDto created = userService.createUser(payload.User().get(0));
        return ResponseEntity.ok(Map.of("User", List.of(created)));
    }

    @PutMapping("/users/update")
    public ResponseEntity<Map<String, List<UserDto>>> updateUser(@RequestBody UserPayload payload) {
        UserDto current = payload.User().get(0);
        UserDto enriched = new UserDto(
                current.id(),
                current.roleId() == null ? 3L : current.roleId(),
                current.email(),
                current.firstName(),
                current.lastName(),
                current.password() == null ? "" : current.password()
        );
        UserDto updated = userService.updateUser(enriched);
        return ResponseEntity.ok(Map.of("User", List.of(updated)));
    }

    @DeleteMapping("/users/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable("id") Long id) {
        domainOrchestrationService.deleteUser(id);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
