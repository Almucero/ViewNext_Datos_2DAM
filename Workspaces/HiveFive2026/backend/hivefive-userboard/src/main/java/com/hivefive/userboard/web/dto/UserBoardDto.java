package com.hivefive.userboard.web.dto;

/**
 * Par tablero-usuario expuesto en API.
 * <p><b>Seguridad:</b> Revela membresias; combinar con autenticacion antes de exponer en produccion publica.
 */
public record UserBoardDto(
        Long boardId,
        Long userId
) {
}
