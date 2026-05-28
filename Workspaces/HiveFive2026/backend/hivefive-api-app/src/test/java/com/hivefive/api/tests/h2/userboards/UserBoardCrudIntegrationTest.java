package com.hivefive.api.tests.h2.userboards;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserBoardCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndListAndDeleteUserBoard() throws Exception {
        long boardId = System.currentTimeMillis() + 600;
        long userId = System.currentTimeMillis() + 601;

        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "ub%d@test.local", "firstName": "Ub", "lastName": "User", "password": "pwd" } ] }
                """.formatted(userId, userId)).andExpect(status().isOk());

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board UB" } ] }
                """.formatted(boardId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/create"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.boardId").value(boardId));

        mockMvc.perform(get("/api/v1/user-boards/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.UserBoard").isArray());

        performJson(post("/api/v1/user-boards/delete"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, userId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldKeepBoardWhenOtherUsersRemain() throws Exception {
        long boardId = System.currentTimeMillis() + 700;
        long firstUserId = System.currentTimeMillis() + 701;
        long secondUserId = System.currentTimeMillis() + 702;

        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "ub_first_%d@test.local", "firstName": "First", "lastName": "User", "password": "pwd" } ] }
                """.formatted(firstUserId, firstUserId)).andExpect(status().isOk());

        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "ub_second_%d@test.local", "firstName": "Second", "lastName": "User", "password": "pwd" } ] }
                """.formatted(secondUserId, secondUserId)).andExpect(status().isOk());

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Shared Board UB" } ] }
                """.formatted(boardId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/create"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, firstUserId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/create"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, secondUserId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/delete"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, firstUserId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Board[0].id").value(boardId));
    }

    @Test
    void shouldDeleteBoardWithCardsAndChecklistWhenLastMemberLeaves() throws Exception {
        long boardId = System.currentTimeMillis() + 800;
        long userId = System.currentTimeMillis() + 801;
        long cardId = System.currentTimeMillis() + 802;
        long checklistId = System.currentTimeMillis() + 803;

        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "cascade%d@test.local", "firstName": "Cascade", "lastName": "User", "password": "pwd" } ] }
                """.formatted(userId, userId)).andExpect(status().isOk());

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Cascade Board" } ] }
                """.formatted(boardId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/create"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, userId)).andExpect(status().isOk());

        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Cascade Card", "description": "Desc", "startDate": "2026-03-01", "endDate": "2026-03-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": %d } ] }
                """.formatted(cardId, boardId, userId)).andExpect(status().isOk());

        performJson(post("/api/v1/checklist-items/create"), """
                { "ChecklistItem": [ { "id": %d, "cardId": %d, "text": "Cascade task", "completed": false, "orderIndex": 1 } ] }
                """.formatted(checklistId, cardId)).andExpect(status().isOk());

        performJson(post("/api/v1/user-boards/delete"), """
                { "boardId": %d, "userId": %d }
                """.formatted(boardId, userId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/checklist-items/get/{id}", checklistId))
                .andExpect(status().isNotFound());
    }
}
