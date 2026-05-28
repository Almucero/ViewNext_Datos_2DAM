package com.hivefive.userboard.repository;

import com.hivefive.userboard.domain.UserBoardEntity;
import com.hivefive.userboard.domain.UserBoardId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Membresias usuario-tablero y comprobacion de existencia por tablero.
 * <p><b>Seguridad:</b> Operaciones sin ACL en repositorio.
 */
public interface UserBoardRepository extends JpaRepository<UserBoardEntity, UserBoardId> {
    boolean existsByIdBoardId(Long boardId);
}
