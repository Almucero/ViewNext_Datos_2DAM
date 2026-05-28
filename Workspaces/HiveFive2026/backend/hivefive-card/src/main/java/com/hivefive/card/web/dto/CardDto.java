package com.hivefive.card.web.dto;

/**
 * Tarjeta en API.
 * <p><b>Seguridad:</b> {@code description} puede contener datos sensibles; sin cifrado ni redaccion en servidor.
 */
public record CardDto(
        Long id,
        String title,
        String description,
        String startDate,
        String endDate,
        Integer priority,
        Long boardId,
        Long statusId,
        Long userId
) {
}
