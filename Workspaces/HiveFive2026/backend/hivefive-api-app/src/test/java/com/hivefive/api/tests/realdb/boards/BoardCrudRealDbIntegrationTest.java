package com.hivefive.api.tests.realdb.boards;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BoardCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldUpsertBoardViaPostUpdateWhenRowDidNotExist() throws Exception {
        long boardId = uniqueId();
        try {
            performJson(post("/api/v1/boards/update"), """
                    { "Board": [ { "id": %d, "name": "UpsertBoardOnly" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Board[0].name").value("UpsertBoardOnly"));
        } finally {
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
        }
    }

    @Test
    void shouldRunFullBoardCrudAgainstRealDb() throws Exception {
        long boardId = uniqueId();

        try {
            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "RealDb Board" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Board[0].id").value(boardId));

            mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Board[0].name").value("RealDb Board"));

            performJson(post("/api/v1/boards/update"), """
                    { "Board": [ { "id": %d, "name": "RealDb Board Updated" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Board[0].name").value("RealDb Board Updated"));

            mockMvc.perform(get("/api/v1/boards/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
        }
    }
}
