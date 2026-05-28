package com.hivefive.checklist.repository;

import com.hivefive.checklist.domain.ChecklistItemEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso CRUD a items de checklist y busqueda por tarjeta.
 * <p><b>Seguridad:</b> Sin aislamiento por usuario.
 */
public interface ChecklistItemRepository extends JpaRepository<ChecklistItemEntity, Long> {
    List<ChecklistItemEntity> findByCardId(Long cardId);
}
