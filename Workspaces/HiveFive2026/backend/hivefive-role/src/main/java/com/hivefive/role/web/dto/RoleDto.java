package com.hivefive.role.web.dto;

/**
 * Rol en API (campo {@code description} por compatibilidad de forma).
 * <p><b>Seguridad:</b> Nombres de rol visibles; no incluye credenciales.
 */
public record RoleDto(
        Long id,
        String name,
        String description
) {
}
