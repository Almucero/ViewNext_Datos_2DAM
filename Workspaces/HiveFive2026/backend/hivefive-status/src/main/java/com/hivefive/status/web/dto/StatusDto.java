package com.hivefive.status.web.dto;

/** Estado de flujo en API (campos duplicados legacy). <p><b>Seguridad:</b> Sin datos de autenticacion. */
public record StatusDto(
        Long id,
        String name,
        String code,
        String description
) {
}
