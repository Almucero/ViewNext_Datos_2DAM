package com.hivefive.api.tests.realdb.common;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Errores HTTP y validaciones sobre el perfil {@code realdb}: misma superficie que
 * {@link com.hivefive.api.tests.h2.common.ErrorHandlingIntegrationTest} para que
 * {@code mvn -DrunRealDbTests=true -Dtest="*RealDbIntegrationTest" test} cubra también
 * APIs de error respecto al contrato público.
 */
class ErrorHandlingRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldReturn400ForInvalidPayload() throws Exception {
        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": null, "roleId": 3, "email": "", "firstName": "", "lastName": "", "password": "" } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidUserBoard() throws Exception {
        performJson(post("/api/v1/user-boards/create"), """
                { "boardId": null, "userId": 1 }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn404ForMissingResource() throws Exception {
        mockMvc.perform(delete("/api/v1/boards/delete/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingUser() throws Exception {
        mockMvc.perform(get("/api/v1/users/get/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingCard() throws Exception {
        mockMvc.perform(get("/api/v1/cards/get/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingRole() throws Exception {
        mockMvc.perform(get("/api/v1/roles/get/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingStatus() throws Exception {
        mockMvc.perform(get("/api/v1/status/get/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingChecklistItem() throws Exception {
        mockMvc.perform(get("/api/v1/checklist-items/get/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForUnknownApiPath() throws Exception {
        mockMvc.perform(get("/api/v1/not-a-defined-endpoint"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn401ForInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/get-all")
                        .header("Authorization", "Bearer INVALID"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("401"));
    }
}
