package com.hivefive.status.web.dto;

import java.util.List;

/** Payload legacy de estados. <p><b>Seguridad:</b> Sin secretos en el tipo. */
public record StatusPayload(List<StatusDto> Status) {
}
