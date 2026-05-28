package com.hivefive.status.repository;

import com.hivefive.status.domain.StatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso CRUD a estados de flujo. <p><b>Seguridad:</b> Sin autorizacion en capa de datos. */
public interface StatusRepository extends JpaRepository<StatusEntity, Long> {
}
