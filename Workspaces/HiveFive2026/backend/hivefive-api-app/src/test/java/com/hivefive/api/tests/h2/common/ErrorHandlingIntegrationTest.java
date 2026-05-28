package com.hivefive.api.tests.h2.common;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ErrorHandlingIntegrationTest extends ApiIntegrationTestBase {

    @Test
    void shouldReturn400ForInvalidUserPayload() throws Exception {
        performJson(post("/api/v1/users/create"), """
                { "User": [ { "id": null, "roleId": 3, "email": "", "firstName": "", "lastName": "", "password": "" } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidBoardPayload() throws Exception {
        performJson(post("/api/v1/boards/create"), """
                { "Board": [ { "id": null, "name": "" } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidCardPayload() throws Exception {
        performJson(post("/api/v1/cards/create"), """
                { "Card": [ { "id": 1, "title": "", "description": "x", "startDate": "2026-01-01", "endDate": "2026-01-02", "priority": 1, "boardId": 1, "statusId": 2, "userId": 1 } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidRolePayload() throws Exception {
        performJson(post("/api/v1/roles/create"), """
                { "Role": [ { "id": null, "name": "", "password": "" } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidStatusPayload() throws Exception {
        performJson(post("/api/v1/status/create"), """
                { "Status": [ { "id": null, "name": "", "password": "" } ] }
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("400"));
    }

    @Test
    void shouldReturn400ForInvalidChecklistItemPayload() throws Exception {
        performJson(post("/api/v1/checklist-items/create"), """
                { "ChecklistItem": [ { "id": 1, "cardId": null, "text": "", "completed": false, "orderIndex": 1 } ] }
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
    void shouldReturn404ForMissingBoard() throws Exception {
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
    void shouldReturn404ForMissingRoleOnDelete() throws Exception {
        mockMvc.perform(delete("/api/v1/roles/delete/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingStatusOnDelete() throws Exception {
        mockMvc.perform(delete("/api/v1/status/delete/{id}", 99999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("404"));
    }

    @Test
    void shouldReturn404ForMissingCardOnDelete() throws Exception {
        mockMvc.perform(delete("/api/v1/cards/delete/{id}", 99999999))
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

    @Test
    void shouldAllowRequestWhenAuthorizationHeaderIsAbsent() throws Exception {
        mockMvc.perform(get("/api/v1/users/get-all"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAllowRequestWhenAuthorizationHeaderIsValidFormat() throws Exception {
        mockMvc.perform(get("/api/v1/users/get-all")
                        .header("Authorization", "Bearer some-other-token"))
                .andExpect(status().isOk());
    }
}
