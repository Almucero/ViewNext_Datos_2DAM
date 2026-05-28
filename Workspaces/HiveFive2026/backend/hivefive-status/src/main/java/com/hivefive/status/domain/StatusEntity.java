package com.hivefive.status.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Estado de flujo JPA. <p><b>Seguridad:</b> Sin datos de autenticacion. */
@Entity
@Table(name = "status")
public class StatusEntity {

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
