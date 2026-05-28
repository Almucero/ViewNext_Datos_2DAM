package com.hivefive.user.repository;

import com.hivefive.user.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso CRUD a {@link com.hivefive.user.domain.UserEntity}.
 * <p><b>Seguridad:</b> Sin controles de autorizacion; solo debe invocarse desde la capa de servicio en el mismo proceso.
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
