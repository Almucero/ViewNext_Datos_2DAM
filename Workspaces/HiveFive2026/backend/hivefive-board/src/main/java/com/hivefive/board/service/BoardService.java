package com.hivefive.board.service;

import com.hivefive.board.domain.BoardEntity;
import com.hivefive.board.repository.BoardRepository;
import com.hivefive.board.web.dto.BoardDto;
import com.hivefive.common.exception.NotFoundException;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @Transactional(readOnly = true)
    public List<BoardDto> getAllBoards() {
        return boardRepository.findAll().stream()
                .sorted(Comparator.comparing(BoardEntity::getId))
                .map(this::toBoardDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public BoardDto getBoardById(Long id) {
        return toBoardDto(boardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Board id " + id + " no existe")));
    }

    @Transactional
    public BoardDto createBoard(BoardDto boardDto) {
        if (boardDto == null || boardDto.id() == null || boardDto.name() == null || boardDto.name().isBlank()) {
            throw new IllegalArgumentException("Board invalido.");
        }
        BoardEntity entity = new BoardEntity();
        entity.setId(boardDto.id());
        entity.setName(boardDto.name());
        return toBoardDto(boardRepository.save(entity));
    }

    @Transactional
    public BoardDto updateBoard(BoardDto boardDto) {
        if (boardDto == null || boardDto.id() == null || boardDto.name() == null || boardDto.name().isBlank()) {
            throw new IllegalArgumentException("Board invalido.");
        }
        BoardEntity entity = boardRepository.findById(boardDto.id()).orElseGet(BoardEntity::new);
        entity.setId(boardDto.id());
        entity.setName(boardDto.name());
        return toBoardDto(boardRepository.save(entity));
    }

    @Transactional
    public void deleteBoard(Long boardId) {
        if (!boardRepository.existsById(boardId)) {
            throw new NotFoundException("Board id " + boardId + " no existe");
        }
        boardRepository.deleteById(boardId);
    }

    public boolean existsById(Long boardId) {
        return boardRepository.existsById(boardId);
    }

    private BoardDto toBoardDto(BoardEntity entity) {
        return new BoardDto(entity.getId(), entity.getName());
    }
}
