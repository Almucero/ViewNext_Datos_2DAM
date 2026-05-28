package com.hivefive.api.web;

import com.hivefive.common.dto.ErrorResponse;
import com.hivefive.common.exception.NotFoundException;
import com.hivefive.common.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Respuestas HTTP homogeneas para excepciones lanzadas desde controladores y servicios.
 * <p><b>Seguridad:</b> {@link #handleGeneric(Exception)} devuelve mensaje generico para no filtrar detalles internos;
 * otros manejadores exponen el mensaje de la excepcion de dominio (evitar datos sensibles en mensajes al lanzar).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Errores de validacion de negocio (400).
     * <p><b>Seguridad:</b> Incluye {@code ex.getMessage()}; no usar para errores con datos confidenciales.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("400", "Peticion incorrecta. " + ex.getMessage()));
    }

    /**
     * Mapea {@link UnauthorizedException} a 401.
     * <p><b>Seguridad:</b> Reservado para logica futura; hoy el mensaje se concatena a la respuesta publica.
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("401", "No autorizado. " + ex.getMessage()));
    }

    /**
     * Recurso de dominio no encontrado (404).
     * <p><b>Seguridad:</b> Mensaje puede revelar ids consultados; aceptable para APIs internas.
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("404", "No encontrado. " + ex.getMessage()));
    }

    /**
     * Ruta estatica o mapping inexistente (404).
     * <p><b>Seguridad:</b> Mensaje generico fijo.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("404", "No encontrado. Recurso no disponible."));
    }

    /**
     * Ante cualquier otra excepcion no manejada (500).
     * <p><b>Seguridad:</b> No incluye stack ni mensaje de la excepcion en la respuesta HTTP.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("500", "Error interno del servidor."));
    }
}
