package com.hivefive.api.web;

import com.hivefive.card.service.CardService;
import com.hivefive.card.web.dto.CardDto;
import com.hivefive.card.web.dto.CardPayload;
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
public class CardCompatibilityController {

    private final CardService cardService;

    public CardCompatibilityController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/cards/get-all")
    public Map<String, List<CardDto>> getAllCards() {
        return Map.of("Card", cardService.getAllCards());
    }

    @GetMapping("/cards/get/{id}")
    public Map<String, List<CardDto>> getCardById(@PathVariable("id") Long id) {
        return Map.of("Card", List.of(cardService.getCardById(id)));
    }

    @PostMapping("/cards/create")
    public ResponseEntity<Map<String, List<CardDto>>> createCard(@RequestBody CardPayload payload) {
        CardDto created = cardService.createCard(payload.Card().get(0));
        return ResponseEntity.ok(Map.of("Card", List.of(created)));
    }

    @PutMapping("/cards/update")
    public ResponseEntity<Map<String, List<CardDto>>> updateCard(@RequestBody CardPayload payload) {
        CardDto updated = cardService.updateCard(payload.Card().get(0));
        return ResponseEntity.ok(Map.of("Card", List.of(updated)));
    }

    @DeleteMapping("/cards/delete/{id}")
    public ResponseEntity<Map<String, String>> deleteCard(@PathVariable("id") Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
