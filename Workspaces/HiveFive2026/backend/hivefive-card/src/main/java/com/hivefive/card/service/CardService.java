package com.hivefive.card.service;

import com.hivefive.card.domain.CardEntity;
import com.hivefive.card.repository.CardRepository;
import com.hivefive.card.web.dto.CardDto;
import com.hivefive.common.exception.NotFoundException;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardService {

    private final CardRepository cardRepository;

    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Transactional(readOnly = true)
    public List<CardDto> getAllCards() {
        return cardRepository.findAll().stream()
                .sorted(Comparator.comparing(CardEntity::getId))
                .map(this::toCardDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CardDto getCardById(Long id) {
        return toCardDto(cardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Card id " + id + " no existe")));
    }

    @Transactional
    public CardDto createCard(CardDto cardDto) {
        requireCard(cardDto);
        CardEntity entity = new CardEntity();
        applyCard(entity, cardDto);
        return toCardDto(cardRepository.save(entity));
    }

    @Transactional
    public CardDto updateCard(CardDto cardDto) {
        requireCard(cardDto);
        CardEntity entity = cardRepository.findById(cardDto.id()).orElseGet(CardEntity::new);
        applyCard(entity, cardDto);
        return toCardDto(cardRepository.save(entity));
    }

    @Transactional
    public void deleteCard(Long cardId) {
        if (!cardRepository.existsById(cardId)) {
            throw new NotFoundException("Card id " + cardId + " no existe");
        }
        cardRepository.deleteById(cardId);
    }

    @Transactional
    public void clearUserAssignments(Long userId) {
        cardRepository.findByUserId(userId).forEach(card -> {
            card.setUserId(null);
            cardRepository.save(card);
        });
    }

    @Transactional(readOnly = true)
    public List<CardEntity> findEntitiesByBoardId(Long boardId) {
        return cardRepository.findByBoardId(boardId);
    }

    @Transactional
    public void deleteById(Long cardId) {
        cardRepository.deleteById(cardId);
    }

    public void flush() {
        cardRepository.flush();
    }

    private void requireCard(CardDto dto) {
        if (dto == null || dto.id() == null || dto.title() == null || dto.title().isBlank()
                || dto.description() == null
                || dto.startDate() == null
                || dto.endDate() == null
                || dto.priority() == null
                || dto.boardId() == null
                || dto.statusId() == null
                || dto.userId() == null) {
            throw new IllegalArgumentException("Card invalido.");
        }
    }

    private void applyCard(CardEntity entity, CardDto dto) {
        entity.setId(dto.id());
        entity.setTitle(dto.title());
        entity.setDescription(dto.description());
        entity.setStartDate(dto.startDate());
        entity.setEndDate(dto.endDate());
        entity.setPriority(dto.priority());
        entity.setBoardId(dto.boardId());
        entity.setStatusId(dto.statusId());
        entity.setUserId(dto.userId());
    }

    private CardDto toCardDto(CardEntity entity) {
        return new CardDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getPriority(),
                entity.getBoardId(),
                entity.getStatusId(),
                entity.getUserId()
        );
    }
}
