package com.hivefive.api.tests.realdb.cards;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CardCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldUpsertCardViaPutWhenRowDidNotExist() throws Exception {
        long boardId = uniqueId();
        long cardId = uniqueId() + 11;
        long userId = uniqueId() + 12;
        String email = "realdb_card_upsert_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Card", "lastName": "Upsert", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "UpsertCardBoard" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/cards/update"), """
                    { "Card": [ { "id": %d, "title": "UpsertTitle", "description": "UpsertDesc", "startDate": "2026-04-01", "endDate": "2026-04-05", "priority": 9, "boardId": %d, "statusId": 2, "userId": %d } ] }
                    """.formatted(cardId, boardId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Card[0].id").value(cardId));

            mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                    .andExpect(status().isOk());
        } finally {
            mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId));
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }

    @Test
    void shouldRunFullCardCrudAgainstRealDb() throws Exception {
        long boardId = uniqueId();
        long cardId = uniqueId() + 1;
        long userId = uniqueId() + 2;
        String email = "realdb_card_user_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Card", "lastName": "Owner", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "CardBoard" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/cards/create"), """
                    { "Card": [ { "id": %d, "title": "Card RealDb", "description": "Desc", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 2, "boardId": %d, "statusId": 2, "userId": %d } ] }
                    """.formatted(cardId, boardId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Card[0].id").value(cardId));

            mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/cards/update"), """
                    { "Card": [ { "id": %d, "title": "Card RealDb Updated", "description": "Desc2", "startDate": "2026-01-03", "endDate": "2026-01-04", "priority": 3, "boardId": %d, "statusId": 3, "userId": %d } ] }
                    """.formatted(cardId, boardId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Card[0].title").value("Card RealDb Updated"));

            mockMvc.perform(get("/api/v1/cards/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId));
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }
}
