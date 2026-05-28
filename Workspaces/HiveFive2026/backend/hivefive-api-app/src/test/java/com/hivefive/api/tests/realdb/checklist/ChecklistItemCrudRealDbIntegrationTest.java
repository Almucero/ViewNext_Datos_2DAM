package com.hivefive.api.tests.realdb.checklist;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChecklistItemCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldUpsertChecklistViaPutWhenRowDidNotExist() throws Exception {
        long boardId = uniqueId();
        long cardId = uniqueId() + 21;
        long userId = uniqueId() + 22;
        long checklistId = uniqueId() + 23;
        String email = "realdb_cl_upsert_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Cl", "lastName": "Upsert", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "ClUpsertBoard" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/cards/create"), """
                    { "Card": [ { "id": %d, "title": "ClUpsertCard", "description": "D", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": %d } ] }
                    """.formatted(cardId, boardId, userId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/checklist-items/update"), """
                    { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "UpsertCli", "completed": false, "orderIndex": 1 } ] }
                    """.formatted(checklistId, cardId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                    .andExpect(status().isOk());
        } finally {
            mockMvc.perform(delete("/api/v1/checklist-items/delete/{id}", checklistId));
            mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId));
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }

    @Test
    void shouldRunFullChecklistCrudAgainstRealDb() throws Exception {
        long boardId = uniqueId();
        long cardId = uniqueId() + 1;
        long userId = uniqueId() + 2;
        long checklistId = uniqueId() + 3;
        String email = "realdb_check_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Check", "lastName": "User", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "ChecklistBoard" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/cards/create"), """
                    { "Card": [ { "id": %d, "title": "ChecklistCard", "description": "Desc", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": %d } ] }
                    """.formatted(cardId, boardId, userId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/checklist-items/create"), """
                    { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "TaskRealDb", "completed": false, "orderIndex": 1 } ] }
                    """.formatted(checklistId, cardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ChecklistItem[0].id").value(checklistId));

            mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/checklist-items/update"), """
                    { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "TaskRealDbUpdated", "completed": true, "orderIndex": 2 } ] }
                    """.formatted(checklistId, cardId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.ChecklistItem[0].completed").value(true));

            mockMvc.perform(get("/api/v1/checklist-items/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/checklist-items/delete/{id}", checklistId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/checklist-items/delete/{id}", checklistId));
            mockMvc.perform(delete("/api/v1/cards/delete/{id}", cardId));
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }
}
