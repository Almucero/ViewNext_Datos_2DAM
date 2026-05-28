package com.hivefive.card.repository;

import com.hivefive.card.domain.CardEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso CRUD a tarjetas y consultas por usuario o tablero.
 * <p><b>Seguridad:</b> Los metodos derivados exponen datos segun filtros logicos sin comprobar identidad.
 */
public interface CardRepository extends JpaRepository<CardEntity, Long> {
    List<CardEntity> findByUserId(Long userId);
    List<CardEntity> findByBoardId(Long boardId);
}
