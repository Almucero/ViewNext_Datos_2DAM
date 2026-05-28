package com.hivefive.board.web.dto;

import java.util.List;

/** Payload legacy con lista {@code Board}. <p><b>Seguridad:</b> Sin secretos en el tipo. */
public record BoardPayload(List<BoardDto> Board) {
}
