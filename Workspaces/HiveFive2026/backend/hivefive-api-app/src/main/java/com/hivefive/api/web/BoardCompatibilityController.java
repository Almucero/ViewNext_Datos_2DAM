package com.hivefive.api.web;

import com.hivefive.api.service.DomainOrchestrationService;
import com.hivefive.board.service.BoardService;
import com.hivefive.board.web.dto.BoardDto;
import com.hivefive.board.web.dto.BoardPayload;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class BoardCompatibilityController {

    private final BoardService boardService;
    private final DomainOrchestrationService domainOrchestrationService;

    public BoardCompatibilityController(BoardService boardService, DomainOrchestrationService domainOrchestrationService) {
        this.boardService = boardService;
        this.domainOrchestrationService = domainOrchestrationService;
    }

    @GetMapping("/boards/get-all")
    public Map<String, List<BoardDto>> getAllBoards() {
        return Map.of("Board", boardService.getAllBoards());
    }

    @GetMapping("/boards/get/{id}")
    public Map<String, List<BoardDto>> getBoardById(@PathVariable("id") Long id) {
        return Map.of("Board", List.of(boardService.getBoardById(id)));
    }

    @PostMapping("/boards/create")
    public ResponseEntity<Map<String, List<BoardDto>>> createBoard(@RequestBody BoardPayload payload) {
        BoardDto created = boardService.createBoard(payload.Board().get(0));
        return ResponseEntity.ok(Map.of("Board", List.of(created)));
    }

    @PostMapping("/boards/update")
    public ResponseEntity<Map<String, List<BoardDto>>> updateBoard(@RequestBody BoardPayload payload) {
        BoardDto updated = boardService.updateBoard(payload.Board().get(0));
        return ResponseEntity.ok(Map.of("Board", List.of(updated)));
    }

    @DeleteMapping("/boards/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteBoard(@PathVariable("id") Long boardId) {
        domainOrchestrationService.deleteBoard(boardId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
