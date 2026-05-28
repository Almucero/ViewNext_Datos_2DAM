package com.hivefive.api.tests.realdb.statuses;

import com.hivefive.api.tests.realdb.common.RealDbApiIntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatusCrudRealDbIntegrationTest extends RealDbApiIntegrationTestBase {

    @Test
    void shouldUpsertStatusViaPutWhenRowDidNotExist() throws Exception {
        long statusId = uniqueId();
        try {
            performJson(put("/api/v1/status/update"), """
                    { "Status": [ { "id": %d, "name": "UPSERT_STAT_%d", "code": "", "description": "" } ] }
                    """.formatted(statusId, statusId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Status[0].name").value("UPSERT_STAT_%d".formatted(statusId)));
        } finally {
            mockMvc.perform(delete("/api/v1/status/delete/{id}", statusId));
        }
    }

    @Test
    void shouldRunFullStatusCrudAgainstRealDb() throws Exception {
        long statusId = uniqueId();
        try {
            performJson(post("/api/v1/status/create"), """
                    { "Status": [ { "id": %d, "name": "STATUS_REALDB_%d", "code": "", "description": "" } ] }
                    """.formatted(statusId, statusId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Status[0].id").value(statusId));

            mockMvc.perform(get("/api/v1/status/get/{id}", statusId))
                    .andExpect(status().isOk());

            performJson(put("/api/v1/status/update"), """
                    { "Status": [ { "id": %d, "name": "STATUS_REALDB_UPDATED_%d", "code": "", "description": "" } ] }
                    """.formatted(statusId, statusId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Status[0].name").value("STATUS_REALDB_UPDATED_%d".formatted(statusId)));

            mockMvc.perform(get("/api/v1/status/get-all"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/v1/status/delete/{id}", statusId))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/status/get/{id}", statusId))
                    .andExpect(status().isNotFound());
        } finally {
            mockMvc.perform(delete("/api/v1/status/delete/{id}", statusId));
        }
    }
}
