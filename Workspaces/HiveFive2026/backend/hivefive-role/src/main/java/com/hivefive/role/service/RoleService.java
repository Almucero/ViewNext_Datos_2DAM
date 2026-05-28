package com.hivefive.role.service;

import com.hivefive.common.exception.NotFoundException;
import com.hivefive.role.domain.RoleEntity;
import com.hivefive.role.repository.RoleRepository;
import com.hivefive.role.web.dto.RoleDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(RoleEntity::getId))
                .map(this::toRoleDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoleDto getRoleById(Long id) {
        return toRoleDto(roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role id " + id + " no existe")));
    }

    @Transactional
    public RoleDto createRole(RoleDto dto) {
        requireRole(dto);
        RoleEntity entity = new RoleEntity();
        applyRole(entity, dto);
        return toRoleDto(roleRepository.save(entity));
    }

    @Transactional
    public RoleDto updateRole(RoleDto dto) {
        requireRole(dto);
        RoleEntity entity = roleRepository.findById(dto.id()).orElseGet(RoleEntity::new);
        applyRole(entity, dto);
        return toRoleDto(roleRepository.save(entity));
    }

    @Transactional
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new NotFoundException("Role id " + id + " no existe");
        }
        roleRepository.deleteById(id);
    }

    private void requireRole(RoleDto dto) {
        if (dto == null || dto.id() == null || dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Role invalido.");
        }
    }

    private void applyRole(RoleEntity entity, RoleDto dto) {
        entity.setId(dto.id());
        entity.setName(dto.name());
    }

    private RoleDto toRoleDto(RoleEntity entity) {
        return new RoleDto(entity.getId(), entity.getName(), "");
    }
}
