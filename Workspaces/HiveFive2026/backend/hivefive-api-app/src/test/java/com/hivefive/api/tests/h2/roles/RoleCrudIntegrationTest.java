package com.hivefive.api.tests.h2.roles;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RoleCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetRole() throws Exception {
        long id = System.currentTimeMillis() + 300;
        performJson(post("/api/v1/roles/create"), """
                { "Role": [ { "id": %d, "name": "ROLE_%d", "description": "Role Desc" } ] }
                """.formatted(id, id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Role[0].id").value(id));

        mockMvc.perform(get("/api/v1/roles/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Role[0].name").value("ROLE_%d".formatted(id)));
    }

    @Test
    void shouldUpdateRole() throws Exception {
        long id = System.currentTimeMillis() + 310;
        performJson(post("/api/v1/roles/create"), """
                { "Role": [ { "id": %d, "name": "ROLE_BEFORE", "description": "Before" } ] }
                """.formatted(id)).andExpect(status().isOk());

        performJson(put("/api/v1/roles/update"), """
                { "Role": [ { "id": %d, "name": "ROLE_AFTER", "description": "After" } ] }
                """.formatted(id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Role[0].name").value("ROLE_AFTER"));
    }

    @Test
    void shouldDeleteRole() throws Exception {
        long id = System.currentTimeMillis() + 320;
        performJson(post("/api/v1/roles/create"), """
                { "Role": [ { "id": %d, "name": "ROLE_DELETE", "description": "Delete" } ] }
                """.formatted(id)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/roles/delete/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/roles/get/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListRoles() throws Exception {
        mockMvc.perform(get("/api/v1/roles/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Role").isArray());
    }
}
