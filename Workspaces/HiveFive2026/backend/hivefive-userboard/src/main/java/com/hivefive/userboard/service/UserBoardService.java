package com.hivefive.userboard.service;

import com.hivefive.userboard.domain.UserBoardEntity;
import com.hivefive.userboard.domain.UserBoardId;
import com.hivefive.userboard.repository.UserBoardRepository;
import com.hivefive.userboard.web.dto.UserBoardDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserBoardService {

    private final UserBoardRepository userBoardRepository;

    public UserBoardService(UserBoardRepository userBoardRepository) {
        this.userBoardRepository = userBoardRepository;
    }

    @Transactional(readOnly = true)
    public List<UserBoardDto> getAllUserBoards() {
        return userBoardRepository.findAll().stream()
                .map(it -> new UserBoardDto(it.getId().getBoardId(), it.getId().getUserId()))
                .toList();
    }

    @Transactional
    public UserBoardDto createUserBoard(UserBoardDto dto) {
        if (dto == null || dto.boardId() == null || dto.userId() == null) {
            throw new IllegalArgumentException("UserBoard invalido.");
        }
        UserBoardEntity entity = new UserBoardEntity(new UserBoardId(dto.boardId(), dto.userId()));
        userBoardRepository.save(entity);
        return dto;
    }

    @Transactional
    public void deleteMembership(Long boardId, Long userId) {
        userBoardRepository.deleteById(new UserBoardId(boardId, userId));
        userBoardRepository.flush();
    }

    @Transactional(readOnly = true)
    public boolean boardHasMembers(Long boardId) {
        return userBoardRepository.existsByIdBoardId(boardId);
    }

    @Transactional
    public void deleteAllForUser(Long userId) {
        userBoardRepository.findAll().stream()
                .filter(it -> it.getId() != null && userId.equals(it.getId().getUserId()))
                .forEach(userBoardRepository::delete);
    }

    @Transactional
    public void deleteAllForBoard(Long boardId) {
        userBoardRepository.findAll().stream()
                .filter(it -> it.getId() != null && boardId.equals(it.getId().getBoardId()))
                .forEach(userBoardRepository::delete);
    }
}
