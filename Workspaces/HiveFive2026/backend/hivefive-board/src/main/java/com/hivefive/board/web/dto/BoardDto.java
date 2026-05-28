package com.hivefive.board.web.dto;

/** Tablero en API. <p><b>Seguridad:</b> Sin datos de autenticacion; el nombre es dato de negocio. */
public record BoardDto(
        Long id,
        String name
) {
}
