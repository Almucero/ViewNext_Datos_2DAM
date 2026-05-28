package com.hivefive.api.tests.h2.checklist;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChecklistItemCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetChecklistItem() throws Exception {
        long boardId = System.currentTimeMillis() + 500;
        long cardId = System.currentTimeMillis() + 501;
        long checklistId = System.currentTimeMillis() + 502;

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Checklist" } ] }
                """.formatted(boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Card Checklist", "description": "Card", "startDate": "2026-03-01", "endDate": "2026-03-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": 1 } ] }
                """.formatted(cardId, boardId)).andExpect(status().isOk());

        performJson(post("/api/v1/checklist-items/create"), """
                { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "Task 1", "completed": false, "orderIndex": 1 } ] }
                """.formatted(checklistId, cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ChecklistItem[0].id").value(checklistId));

        mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ChecklistItem[0].text").value("Task 1"));
    }

    @Test
    void shouldUpdateChecklistItem() throws Exception {
        long boardId = System.currentTimeMillis() + 510;
        long cardId = System.currentTimeMillis() + 511;
        long checklistId = System.currentTimeMillis() + 512;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Checklist Update" } ] }
                """.formatted(boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Card Checklist Update", "description": "Card", "startDate": "2026-03-01", "endDate": "2026-03-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": 1 } ] }
                """.formatted(cardId, boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/checklist-items/create"), """
                { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "Before", "completed": false, "orderIndex": 1 } ] }
                """.formatted(checklistId, cardId)).andExpect(status().isOk());

        performJson(put("/api/v1/checklist-items/update"), """
                { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "After", "completed": true, "orderIndex": 2 } ] }
                """.formatted(checklistId, cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ChecklistItem[0].completed").value(true));
    }

    @Test
    void shouldDeleteChecklistItem() throws Exception {
        long boardId = System.currentTimeMillis() + 520;
        long cardId = System.currentTimeMillis() + 521;
        long checklistId = System.currentTimeMillis() + 522;
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Checklist Delete" } ] }
                """.formatted(boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Card Checklist Delete", "description": "Card", "startDate": "2026-03-01", "endDate": "2026-03-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": 1 } ] }
                """.formatted(cardId, boardId)).andExpect(status().isOk());
        performJson(post("/api/v1/checklist-items/create"), """
                { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "Delete", "completed": false, "orderIndex": 1 } ] }
                """.formatted(checklistId, cardId)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/checklist-items/delete/{id}", checklistId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListChecklistItems() throws Exception {
        mockMvc.perform(get("/api/v1/checklist-items/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ChecklistItem").isArray());
    }
}
