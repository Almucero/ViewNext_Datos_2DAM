package com.hivefive.checklist.service;

import com.hivefive.checklist.domain.ChecklistItemEntity;
import com.hivefive.checklist.repository.ChecklistItemRepository;
import com.hivefive.checklist.web.dto.ChecklistItemDto;
import com.hivefive.common.exception.NotFoundException;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;

    public ChecklistItemService(ChecklistItemRepository checklistItemRepository) {
        this.checklistItemRepository = checklistItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemDto> getAllChecklistItems() {
        return checklistItemRepository.findAll().stream()
                .sorted(Comparator.comparing(ChecklistItemEntity::getId))
                .map(this::toChecklistItemDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChecklistItemDto getChecklistItemById(Long id) {
        return toChecklistItemDto(checklistItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ChecklistItem id " + id + " no existe")));
    }

    @Transactional
    public ChecklistItemDto createChecklistItem(ChecklistItemDto dto) {
        requireChecklistItem(dto);
        ChecklistItemEntity entity = new ChecklistItemEntity();
        applyChecklistItem(entity, dto);
        return toChecklistItemDto(checklistItemRepository.save(entity));
    }

    @Transactional
    public ChecklistItemDto updateChecklistItem(ChecklistItemDto dto) {
        requireChecklistItem(dto);
        ChecklistItemEntity entity = checklistItemRepository.findById(dto.id()).orElseGet(ChecklistItemEntity::new);
        applyChecklistItem(entity, dto);
        return toChecklistItemDto(checklistItemRepository.save(entity));
    }

    @Transactional
    public void deleteChecklistItem(Long id) {
        if (!checklistItemRepository.existsById(id)) {
            throw new NotFoundException("ChecklistItem id " + id + " no existe");
        }
        checklistItemRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllByCardId(Long cardId) {
        checklistItemRepository.findByCardId(cardId).forEach(checklistItemRepository::delete);
    }

    private void requireChecklistItem(ChecklistItemDto dto) {
        if (dto == null || dto.id() == null || dto.cardId() == null || dto.text() == null || dto.text().isBlank()
                || dto.completed() == null || dto.orderIndex() == null) {
            throw new IllegalArgumentException("ChecklistItem invalido.");
        }
    }

    private void applyChecklistItem(ChecklistItemEntity entity, ChecklistItemDto dto) {
        entity.setId(dto.id());
        entity.setCardId(dto.cardId());
        entity.setText(dto.text());
        entity.setCompleted(Boolean.TRUE.equals(dto.completed()) ? 1 : 0);
        entity.setOrderIndex(dto.orderIndex());
    }

    private ChecklistItemDto toChecklistItemDto(ChecklistItemEntity entity) {
        return new ChecklistItemDto(
                entity.getId(),
                entity.getCardId(),
                entity.getText(),
                entity.getCompleted() != null && entity.getCompleted() == 1,
                entity.getOrderIndex()
        );
    }
}
