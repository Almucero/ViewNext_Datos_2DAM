package com.hivefive.api.tests.realdb.userboards;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserBoardCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldDeleteBoardViaUserBoardCleanupWhenLastMemberLeaves() throws Exception {
        long boardId = uniqueId();
        long userId = uniqueId() + 1;
        String email = "realdb_ub_cascade_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Ub", "lastName": "Cascade", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "UserBoardCascade" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/user-boards/create"), """
                    { "boardId": %d, "userId": %d }
                    """.formatted(boardId, userId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/user-boards/delete"), """
                    { "boardId": %d, "userId": %d }
                    """.formatted(boardId, userId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/boards/get/{id}", boardId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }

    @Test
    void shouldRunUserBoardFlowAgainstRealDb() throws Exception {
        long boardId = uniqueId();
        long userId = uniqueId() + 1;
        String email = "realdb_ub_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Ub", "lastName": "User", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/boards/create"), """
                    { "Board": [ { "id": %d, "name": "UserBoardReal" } ] }
                    """.formatted(boardId))
                    .andExpect(status().isOk());

            performJson(post("/api/v1/user-boards/create"), """
                    { "boardId": %d, "userId": %d }
                    """.formatted(boardId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.boardId").value(boardId));

            mockMvc.perform(get("/api/v1/user-boards/get-all"))
                    .andExpect(status().isOk());
        } finally {
            performJson(post("/api/v1/user-boards/delete"), """
                    { "boardId": %d, "userId": %d }
                    """.formatted(boardId, userId)).andReturn();
            mockMvc.perform(delete("/api/v1/boards/delete/{id}", boardId));
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }
}
