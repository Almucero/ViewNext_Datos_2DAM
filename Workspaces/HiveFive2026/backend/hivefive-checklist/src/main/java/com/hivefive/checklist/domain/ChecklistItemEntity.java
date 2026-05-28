package com.hivefive.checklist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Item de checklist JPA. <p><b>Seguridad:</b> Texto almacenado tal cual. */
@Entity
@Table(name = "checklist_item")
public class ChecklistItemEntity {

    @Id
    private Long id;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(name = "name", nullable = false)
    private String text;

    @Column(name = "completed", nullable = false)
    private Integer completed;

    @Column(name = "task_id", nullable = false)
    private Integer orderIndex;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getCompleted() {
        return completed;
    }

    public void setCompleted(Integer completed) {
        this.completed = completed;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}
