package com.hivefive.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro HTTP para compatibilidad con pruebas de error 401.
 * <p><b>Seguridad:</b> No valida JWT ni sesiones. Solo compara la cabecera {@code Authorization} con el literal
 * {@code Bearer INVALID} y en ese caso responde 401; en cualquier otro caso continua la cadena sin establecer
 * autenticacion. No sustituye un mecanismo real de control de acceso.
 */
@Component
public class AuthCompatibilityFilter extends OncePerRequestFilter {

    /**
     * Procesa la peticion aplicando la regla del token de prueba invalido.
     * <p><b>Seguridad:</b> Ver descripcion de clase; el resto del trafico queda sin autenticar a nivel filtro.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if ("Bearer INVALID".equals(authorization)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType("application/json");
            response.getWriter().write("{\"codigo\":\"401\",\"mensaje\":\"No autorizado. Token invalido.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
