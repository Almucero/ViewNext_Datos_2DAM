package com.hivefive.checklist.web.dto;

import java.util.List;

/** Payload legacy checklist. <p><b>Seguridad:</b> Texto de items en claro. */
public record ChecklistItemPayload(List<ChecklistItemDto> ChecklistItem) {
}
