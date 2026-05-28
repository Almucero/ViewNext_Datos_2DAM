package com.hivefive.role.web.dto;

import java.util.List;

/** Payload legacy de roles. <p><b>Seguridad:</b> Sin secretos en el tipo. */
public record RolePayload(List<RoleDto> Role) {
}
