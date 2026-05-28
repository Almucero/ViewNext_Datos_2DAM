package com.hivefive.card.web.dto;

import java.util.List;

/** Payload legacy con lista {@code Card}. <p><b>Seguridad:</b> Contenido de tarjeta en claro. */
public record CardPayload(List<CardDto> Card) {
}
