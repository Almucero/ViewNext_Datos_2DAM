package com.hivefive.api.tests.h2.boards;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BoardCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetBoard() throws Exception {
        long id = System.currentTimeMillis() + 100;
        String createBody = """
                { "Board": [ { "id": %d, "name": "Board %d" } ] }
                """.formatted(id, id);

        performJson(post("/api/v1/boards/create"), createBody)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Board[0].id").value(id));

        mockMvc.perform(get("/api/v1/boards/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Board[0].name").value("Board %d".formatted(id)));
    }

    @Test
    void shouldUpdateBoard() throws Exception {
        long id = System.currentTimeMillis() + 110;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Original Board" } ] }
                """.formatted(id)).andExpect(status().isOk());

        performJson(post("/api/v1/boards/update"), """
                { "Board": [ { "id": %d, "name": "Updated Board" } ] }
                """.formatted(id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Board[0].name").value("Updated Board"));
    }

    @Test
    void shouldDeleteBoard() throws Exception {
        long id = System.currentTimeMillis() + 120;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Delete Board" } ] }
                """.formatted(id)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/boards/delete/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/boards/get/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListBoards() throws Exception {
        mockMvc.perform(get("/api/v1/boards/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Board").isArray());
    }
}
