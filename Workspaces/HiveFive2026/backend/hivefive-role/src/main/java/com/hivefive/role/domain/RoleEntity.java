package com.hivefive.role.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Rol JPA. <p><b>Seguridad:</b> Nombre de rol sensible a enumeracion; sin permisos embebidos. */
@Entity
@Table(name = "role")
public class RoleEntity {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
