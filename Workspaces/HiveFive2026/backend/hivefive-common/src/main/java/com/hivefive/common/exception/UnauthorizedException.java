package com.hivefive.common.exception;

/**
 * Error de negocio que debe mapearse a HTTP 401.
 * <p><b>Seguridad:</b> Usar cuando exista comprobacion de credenciales o permisos.
 */
public class UnauthorizedException extends RuntimeException {
    /** Crea la excepcion con mensaje expuesto al cliente tras prefijo estandar en el handler. */
    public UnauthorizedException(String message) {
        super(message);
    }
}
