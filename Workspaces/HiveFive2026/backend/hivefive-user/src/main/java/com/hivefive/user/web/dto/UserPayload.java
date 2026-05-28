package com.hivefive.user.web.dto;

import java.util.List;

/**
 * Contenedor legacy para operaciones de usuario (lista bajo clave {@code User}).
 * <p><b>Seguridad:</b> Hereda el riesgo de {@link UserDto} (contraseña en claro en cuerpo y respuesta).
 */
public record UserPayload(List<UserDto> User) {
}
