package com.hivefive.userboard.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Membresia usuario-tablero. <p><b>Seguridad:</b> Clave embebida {@link UserBoardId}; sin ACL en entidad. */
@Entity
@Table(name = "user_board")
public class UserBoardEntity {

    @EmbeddedId
    private UserBoardId id;

    public UserBoardEntity() {
    }

    public UserBoardEntity(UserBoardId id) {
        this.id = id;
    }

    public UserBoardId getId() {
        return id;
    }

    public void setId(UserBoardId id) {
        this.id = id;
    }
}
