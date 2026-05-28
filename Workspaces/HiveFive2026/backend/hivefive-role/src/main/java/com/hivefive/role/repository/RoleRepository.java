package com.hivefive.role.repository;

import com.hivefive.role.domain.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso CRUD a roles. <p><b>Seguridad:</b> Sin autorizacion en capa de datos. */
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
}
