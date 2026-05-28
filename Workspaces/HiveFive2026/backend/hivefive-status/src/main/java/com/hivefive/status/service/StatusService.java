package com.hivefive.status.service;

import com.hivefive.common.exception.NotFoundException;
import com.hivefive.status.domain.StatusEntity;
import com.hivefive.status.repository.StatusRepository;
import com.hivefive.status.web.dto.StatusDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    @Transactional(readOnly = true)
    public List<StatusDto> getAllStatuses() {
        return statusRepository.findAll().stream()
                .sorted(Comparator.comparing(StatusEntity::getId))
                .map(this::toStatusDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public StatusDto getStatusById(Long id) {
        return toStatusDto(statusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Status id " + id + " no existe")));
    }

    @Transactional
    public StatusDto createStatus(StatusDto dto) {
        requireStatus(dto);
        StatusEntity entity = new StatusEntity();
        applyStatus(entity, dto);
        return toStatusDto(statusRepository.save(entity));
    }

    @Transactional
    public StatusDto updateStatus(StatusDto dto) {
        requireStatus(dto);
        StatusEntity entity = statusRepository.findById(dto.id()).orElseGet(StatusEntity::new);
        applyStatus(entity, dto);
        return toStatusDto(statusRepository.save(entity));
    }

    @Transactional
    public void deleteStatus(Long id) {
        if (!statusRepository.existsById(id)) {
            throw new NotFoundException("Status id " + id + " no existe");
        }
        statusRepository.deleteById(id);
    }

    private void requireStatus(StatusDto dto) {
        if (dto == null || dto.id() == null || dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Status invalido.");
        }
    }

    private void applyStatus(StatusEntity entity, StatusDto dto) {
        entity.setId(dto.id());
        entity.setName(dto.name());
    }

    private StatusDto toStatusDto(StatusEntity entity) {
        return new StatusDto(entity.getId(), entity.getName(), entity.getName(), "");
    }
}
