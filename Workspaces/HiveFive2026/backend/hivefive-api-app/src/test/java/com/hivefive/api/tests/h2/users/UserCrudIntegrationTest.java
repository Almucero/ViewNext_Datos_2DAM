package com.hivefive.api.tests.h2.users;

import com.hivefive.api.tests.h2.common.ApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserCrudIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldCreateAndGetUserById() throws Exception {
        long id = System.currentTimeMillis();
        String createBody = """
                {
                  "User": [
                    {
                      "id": %d,
                      "roleId": 3,
                      "email": "user%d@test.local",
                      "firstName": "User",
                      "lastName": "Test",
                      "password": "pwd123"
                    }
                  ]
                }
                """.formatted(id, id);

        performJson(post("/api/v1/users/create"), createBody)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].id").value(id));

        mockMvc.perform(get("/api/v1/users/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].email").value("user%d@test.local".formatted(id)));
    }

    @Test
    void shouldUpdateUser() throws Exception {
        long id = System.currentTimeMillis() + 10;
        String createBody = """
                { "User": [ { "id": %d, "roleId": 3, "email": "up%d@test.local", "firstName": "Up", "lastName": "Before", "password": "pwd" } ] }
                """.formatted(id, id);
        performJson(post("/api/v1/users/create"), createBody).andExpect(status().isOk());

        String updateBody = """
                { "User": [ { "id": %d, "roleId": 3, "email": "up%d@test.local", "firstName": "Updated", "lastName": "After", "password": "pwd" } ] }
                """.formatted(id, id);
        performJson(put("/api/v1/users/update"), updateBody)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].firstName").value("Updated"));
    }

    @Test
    void shouldDeleteUser() throws Exception {
        long id = System.currentTimeMillis() + 20;
        String createBody = """
                { "User": [ { "id": %d, "roleId": 3, "email": "del%d@test.local", "firstName": "Del", "lastName": "User", "password": "pwd" } ] }
                """.formatted(id, id);
        performJson(post("/api/v1/users/create"), createBody).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/users/delete/{id}", id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/users/get/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users/get-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[*].id").isArray())
                .andExpect(jsonPath("$.User[*].roleId", hasItem(1)));
    }

    @Test
    void shouldPreservePasswordWhenUpdateSendsBlankPassword() throws Exception {
        long id = System.currentTimeMillis() + 30;
        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "pwd%d@test.local", "firstName": "Pwd", "lastName": "User", "password": "secret123" } ] }
                """.formatted(id, id)).andExpect(status().isOk());

        performJson(put("/api/v1/users/update"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "pwd%d@test.local", "firstName": "Pwd", "lastName": "User", "password": "" } ] }
                """.formatted(id, id))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/users/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].password").value("secret123"));
    }

    @Test
    void shouldUpsertUserWhenUpdatingNonExistingId() throws Exception {
        long id = System.currentTimeMillis() + 40;
        performJson(put("/api/v1/users/update"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "upsert%d@test.local", "firstName": "Upsert", "lastName": "User", "password": "pwd" } ] }
                """.formatted(id, id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].id").value(id));

        mockMvc.perform(get("/api/v1/users/get/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.User[0].email").value("upsert%d@test.local".formatted(id)));
    }

    @Test
    void shouldClearCardUserReferenceWhenDeletingUser() throws Exception {
        long userId = System.currentTimeMillis() + 50;
        long boardId = System.currentTimeMillis() + 51;
        long cardId = System.currentTimeMillis() + 52;

        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": %d, "roleId": 3, "email": "cardowner%d@test.local", "firstName": "Owner", "lastName": "User", "password": "pwd" } ] }
                """.formatted(userId, userId)).andExpect(status().isOk());

        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": %d, "name": "Board Owner Delete" } ] }
                """.formatted(boardId)).andExpect(status().isOk());

        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": %d, "title": "Owned Card", "description": "Desc", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 1, "boardId": %d, "statusId": 2, "userId": %d } ] }
                """.formatted(cardId, boardId, userId)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/users/delete/{id}", userId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/cards/get/{id}", cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Card[0].userId").value(nullValue()));
    }
}
