package com.hivefive.api.web;

import com.hivefive.common.dto.ErrorResponse;
import com.hivefive.common.exception.NotFoundException;
import com.hivefive.common.exception.UnauthorizedException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleBadRequestReturns400WithMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.handleBadRequest(new IllegalArgumentException("User invalido."));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("400", response.getBody().codigo());
        assertEquals("Peticion incorrecta. User invalido.", response.getBody().mensaje());
    }

    @Test
    void handleUnauthorizedReturns401WithMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorized(new UnauthorizedException("Token invalido."));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("401", response.getBody().codigo());
        assertEquals("No autorizado. Token invalido.", response.getBody().mensaje());
    }

    @Test
    void handleNotFoundReturns404WithMessage() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(new NotFoundException("User id 9 no existe"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("404", response.getBody().codigo());
        assertEquals("No encontrado. User id 9 no existe", response.getBody().mensaje());
    }

    @Test
    void handleResourceNotFoundReturns404WithGenericMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleResourceNotFound(
                new NoResourceFoundException(HttpMethod.GET, "/api/v1/unknown"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("404", response.getBody().codigo());
        assertEquals("No encontrado. Recurso no disponible.", response.getBody().mensaje());
    }

    @Test
    void handleGenericReturns500WithoutInternalDetails() {
        ResponseEntity<ErrorResponse> response =
                handler.handleGeneric(new RuntimeException("database secret"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("500", response.getBody().codigo());
        assertEquals("Error interno del servidor.", response.getBody().mensaje());
        assertFalse(response.getBody().mensaje().contains("database secret"));
    }
}
