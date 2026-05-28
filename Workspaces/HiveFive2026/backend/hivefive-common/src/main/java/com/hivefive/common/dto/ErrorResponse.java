package com.hivefive.common.dto;

/**
 * Cuerpo JSON estandar de error ({@code codigo}, {@code mensaje}).
 * <p><b>Seguridad:</b> El campo {@code mensaje} se envia al cliente; no debe contener secretos ni trazas internas.
 */
public record ErrorResponse(
        String codigo,
        String mensaje
) {
}
