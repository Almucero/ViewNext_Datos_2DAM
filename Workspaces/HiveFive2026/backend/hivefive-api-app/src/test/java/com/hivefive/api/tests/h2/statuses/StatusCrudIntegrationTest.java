package com.hivefive.api.tests.h2.statuses;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatusCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetStatus() throws Exception {
        long id = System.currentTimeMillis() + 400;
        performJson(post("/api/v1/status/create"), """
                { "Status": [ { "id": %d, "name": "Status %d", "code": "status_%d", "description": "Desc" } ] }
                """.formatted(id, id, id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Status[0].id").value(id));

        mockMvc.perform(get("/api/v1/status/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Status[0].code").value("Status %d".formatted(id)));
    }

    @Test
    void shouldUpdateStatus() throws Exception {
        long id = System.currentTimeMillis() + 410;
        performJson(post("/api/v1/status/create"), """
                { "Status": [ { "id": %d, "name": "Before", "code": "before", "description": "Before" } ] }
                """.formatted(id)).andExpect(status().isOk());

        performJson(put("/api/v1/status/update"), """
                { "Status": [ { "id": %d, "name": "After", "code": "after", "description": "After" } ] }
                """.formatted(id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Status[0].name").value("After"));
    }

    @Test
    void shouldDeleteStatus() throws Exception {
        long id = System.currentTimeMillis() + 420;
        performJson(post("/api/v1/status/create"), """
                { "Status": [ { "id": %d, "name": "Delete", "code": "delete", "description": "Delete" } ] }
                """.formatted(id)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/status/delete/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/status/get/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListStatuses() throws Exception {
        mockMvc.perform(get("/api/v1/status/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Status").isArray());
    }
}
