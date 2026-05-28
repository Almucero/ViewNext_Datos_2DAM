package com.hivefive.api.tests.realdb.roles;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RoleCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldUpsertRoleViaPutWhenRowDidNotExist() throws Exception {
        long roleId = uniqueId();
        try {
            performJson(put("/api/v1/roles/update"), """
                    { "Role": [ { "id": %d, "name": "UPSERT_ROLE_%d", "description": "" } ] }
                    """.formatted(roleId, roleId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Role[0].name").value("UPSERT_ROLE_%d".formatted(roleId)));
        } finally {
            mockMvc.perform(delete("/api/v1/roles/delete/{id}", roleId));
        }
    }

    @Test
    void shouldRunFullRoleCrudAgainstRealDb() throws Exception {
        long roleId = uniqueId();
        try {
            performJson(post("/api/v1/roles/create"), """
                    { "Role": [ { "id": %d, "name": "ROLE_REALDB_%d", "description": "" } ] }
                    """.formatted(roleId, roleId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Role[0].id").value(roleId));

            mockMvc.perform(get("/api/v1/roles/get/{id}", roleId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/roles/update"), """
                    { "Role": [ { "id": %d, "name": "ROLE_REALDB_UPDATED_%d", "description": "" } ] }
                    """.formatted(roleId, roleId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Role[0].name").value("ROLE_REALDB_UPDATED_%d".formatted(roleId)));

            mockMvc.perform(get("/api/v1/roles/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/roles/delete/{id}", roleId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/roles/get/{id}", roleId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/roles/delete/{id}", roleId));
        }
    }
}
