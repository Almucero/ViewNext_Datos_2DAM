package com.hivefive.user.service;

import com.hivefive.common.exception.NotFoundException;
import com.hivefive.user.domain.UserEntity;
import com.hivefive.user.repository.UserRepository;
import com.hivefive.user.web.dto.UserDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(UserEntity::getId))
                .map(this::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        return toUserDto(userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User id " + id + " no existe")));
    }

    @Transactional
    public UserDto createUser(UserDto userDto) {
        requireUser(userDto);
        UserEntity entity = new UserEntity();
        entity.setId(userDto.id());
        entity.setRoleId(userDto.roleId());
        entity.setEmail(userDto.email());
        entity.setFirstName(userDto.firstName());
        entity.setLastName(userDto.lastName());
        entity.setPassword(userDto.password());
        return toUserDto(userRepository.save(entity));
    }

    @Transactional
    public UserDto updateUser(UserDto userDto) {
        requireUser(userDto);
        UserEntity current = userRepository.findById(userDto.id()).orElse(null);
        UserEntity entity = current == null ? new UserEntity() : current;
        entity.setId(userDto.id());
        entity.setRoleId(userDto.roleId() == null ? (current == null ? 3L : current.getRoleId()) : userDto.roleId());
        entity.setEmail(userDto.email());
        entity.setFirstName(userDto.firstName());
        entity.setLastName(userDto.lastName());
        entity.setPassword(userDto.password() == null || userDto.password().isBlank()
                ? (current == null ? "" : current.getPassword())
                : userDto.password());
        return toUserDto(userRepository.save(entity));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User id " + id + " no existe");
        }
        userRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    private void requireUser(UserDto dto) {
        if (dto == null || dto.id() == null || dto.roleId() == null || dto.email() == null || dto.email().isBlank()
                || dto.firstName() == null || dto.firstName().isBlank()
                || dto.lastName() == null || dto.lastName().isBlank()
                || dto.password() == null) {
            throw new IllegalArgumentException("User invalido.");
        }
    }

    private UserDto toUserDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getRoleId(),
                entity.getEmail(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getPassword()
        );
    }
}
