package com.hivefive.api.web;

import com.hivefive.api.service.DomainOrchestrationService;
import com.hivefive.userboard.service.UserBoardService;
import com.hivefive.userboard.web.dto.UserBoardDto;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserBoardCompatibilityController {

    private final UserBoardService userBoardService;
    private final DomainOrchestrationService domainOrchestrationService;

    public UserBoardCompatibilityController(
            UserBoardService userBoardService,
            DomainOrchestrationService domainOrchestrationService) {
        this.userBoardService = userBoardService;
        this.domainOrchestrationService = domainOrchestrationService;
    }

    @GetMapping("/user-boards/get-all")
    public Map<String, List<UserBoardDto>> getAllUserBoards() {
        return Map.of("UserBoard", userBoardService.getAllUserBoards());
    }

    @PostMapping("/user-boards/create")
    public ResponseEntity<UserBoardDto> createUserBoard(@RequestBody UserBoardDto payload) {
        return ResponseEntity.ok(userBoardService.createUserBoard(payload));
    }

    @PostMapping("/user-boards/delete")
    public ResponseEntity<UserBoardDto> deleteUserBoard(@RequestBody UserBoardDto payload) {
        return ResponseEntity.ok(domainOrchestrationService.deleteUserBoard(payload));
    }
}
