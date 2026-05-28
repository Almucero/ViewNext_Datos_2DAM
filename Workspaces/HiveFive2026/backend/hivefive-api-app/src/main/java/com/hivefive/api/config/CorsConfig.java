package com.hivefive.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Origenes y cabeceras permitidos para llamadas desde navegador (frontends locales).
 * <p><b>Seguridad:</b> Mitiga peticiones cross-origin no deseadas desde otros dominios en el navegador; no protege
 * llamadas directas con curl, Postman o servidores. Debe alinearse con el despliegue real (variables de entorno).
 */
@Configuration
public class CorsConfig {

    /**
     * Registra mapeo CORS global {@code /**}.
     * <p><b>Seguridad:</b> Limita {@code allowedOrigins} a hosts de desarrollo conocidos; metodos y cabeceras explicitos.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            /**
             * Aplica la politica CORS al registro de Spring MVC.
             * <p><b>Seguridad:</b> Ver {@link CorsConfig}.
             */
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // Aquí hemos añadido los puertos de Vite/React
                        .allowedOrigins(
                            "http://localhost:8000", 
                            "http://localhost:5173", 
                            "http://localhost:5174"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("Content-Type", "Authorization", "X-Requested-With");
            }
        };
    }
}