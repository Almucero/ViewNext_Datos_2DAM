package com.hivefive.board.repository;

import com.hivefive.board.domain.BoardEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso CRUD a tableros.
 * <p><b>Seguridad:</b> Sin autorizacion a nivel repositorio.
 */
public interface BoardRepository extends JpaRepository<BoardEntity, Long> {
}
