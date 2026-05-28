package com.hivefive.common.exception;

/**
 * Indica que un identificador de dominio no existe; se traduce a HTTP 404.
 * <p><b>Seguridad:</b> Evitar mensajes que enumeren recursos internos no autorizados si la API fuera multi-tenant.
 */
public class NotFoundException extends RuntimeException {
    /** Mensaje incluido en cuerpo JSON de error (evitar datos sensibles). */
    public NotFoundException(String message) {
        super(message);
    }
}
