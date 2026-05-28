package com.hivefive.checklist.web.dto;

/**
 * Item de checklist.
 * <p><b>Seguridad:</b> {@code text} es contenido de usuario; escapar en UI para evitar XSS.
 */
public record ChecklistItemDto(
        Long id,
        Long cardId,
        String text,
        Boolean completed,
        Integer orderIndex
) {
}
