package com.hivefive.api.tests.realdb.users;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldRunFullUserCrudAgainstRealDb() throws Exception {
        long userId = uniqueId();
        String email = "realdb_user_" + userId + "@test.local";

        try {
            performJson(post("/api/v1/users/create"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Real", "lastName": "Db", "password": "1234" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.User[0].id").value(userId));

            mockMvc.perform(get("/api/v1/users/get/{id}", userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.User[0].email").value(email));

            performJson(put("/api/v1/users/update"), """
                    { "User": [ { "id": %d, "roleId": null, "email": "%s", "firstName": "RealUpdated", "lastName": "DbUpdated", "password": null } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.User[0].firstName").value("RealUpdated"))
                    .andExpect(jsonPath("$.User[0].roleId").value(3));

            mockMvc.perform(get("/api/v1/users/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/users/get/{id}", userId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }

    @Test
    void shouldUpsertUserViaPutWhenRowDidNotExist() throws Exception {
        long userId = uniqueId();
        String email = "realdb_user_upsert_" + userId + "@test.local";
        try {
            performJson(put("/api/v1/users/update"), """
                    { "User": [ { "id": %d, "roleId": 3, "email": "%s", "firstName": "Upsert", "lastName": "Only", "password": "nuevo" } ] }
                    """.formatted(userId, email))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.User[0].id").value(userId));

            mockMvc.perform(get("/api/v1/users/get/{id}", userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.User[0].email").value(email));
        } finally {
            mockMvc.perform(delete("/api/v1/users/delete/{id}", userId));
        }
    }
}
