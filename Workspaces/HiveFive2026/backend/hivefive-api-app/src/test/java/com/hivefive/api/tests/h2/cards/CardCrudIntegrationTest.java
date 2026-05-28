package com.hivefive.api.tests.h2.cards;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CardCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetCard() throws Exception {
        long boardId = System.currentTimeMillis() + 200;
        long cardId = System.currentTimeMillis() + 201;

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board For Card" } ] }
                """.formatted(boardId)).andExpect(status().isOk());

        String createBody = """
                {
                  "Card": [
                    {
                      "id": %d,
                      "title": "Card Title",
                      "description": "Card Description",
                      "startDate": "2026-01-01",
                      "endDate": "2026-12-31",
                      "priority": 3,
                      "boardId": %d,
                      "statusId": 2,
                      "userId": 1
                    }
                  ]
                }
                """.formatted(cardId, boardId);

        performJson(post("/api/v1/cards/create"), createBody)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Card[0].id").value(cardId));

        mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Card[0].title").value("Card Title"));
    }

    @Test
    void shouldUpdateCard() throws Exception {
        long boardId = System.currentTimeMillis() + 210;
        long cardId = System.currentTimeMillis() + 211;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Update Card" } ] }
                """.formatted(boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Old", "description": "Old", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": 1 } ] }
                """.formatted(cardId, boardId)).andExpect(status().isOk());

        performJson(put("/api/v1/cards/update"), """
                { "Card": [ { "id": %d, "title": "New", "description": "New", "startDate": "2026-01-01", "endDate": "2026-01-05", "priority": 5, "boardId": %d, "statusId": 3, "userId": 1 } ] }
                """.formatted(cardId, boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Card[0].title").value("New"))
                .andExpect(jsonPath("$.Card[0].statusId").value(3));
    }

    @Test
    void shouldDeleteCard() throws Exception {
        long boardId = System.currentTimeMillis() + 220;
        long cardId = System.currentTimeMillis() + 221;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Delete Card" } ] }
                """.formatted(boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "ToDelete", "description": "ToDelete", "startDate": "2026-02-01", "endDate": "2026-02-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": 1 } ] }
                """.formatted(cardId, boardId)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListCards() throws Exception {
        mockMvc.perform(get("/api/v1/cards/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Card").isArray());
    }
}
