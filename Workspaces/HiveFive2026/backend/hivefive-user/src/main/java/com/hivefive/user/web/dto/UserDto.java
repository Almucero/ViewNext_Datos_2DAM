package com.hivefive.user.web.dto;

/**
 * Usuario en capa API.
 * <p><b>Seguridad:</b> Incluye {@code password} en serializacion JSON; riesgo de exposicion en red y logs.
 */
public record UserDto(
        Long id,
        Long roleId,
        String email,
        String firstName,
        String lastName,
        String password
) {
}
