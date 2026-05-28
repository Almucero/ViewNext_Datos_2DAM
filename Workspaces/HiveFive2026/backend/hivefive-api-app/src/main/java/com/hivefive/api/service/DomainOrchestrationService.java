package com.hivefive.api.service;

import com.hivefive.board.service.BoardService;
import com.hivefive.card.service.CardService;
import com.hivefive.checklist.service.ChecklistItemService;
import com.hivefive.user.service.UserService;
import com.hivefive.userboard.service.UserBoardService;
import com.hivefive.userboard.web.dto.UserBoardDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestacion transversal entre bounded contexts (operaciones que cruzan modulos).
 */
@Service
public class DomainOrchestrationService {

    private final UserService userService;
    private final BoardService boardService;
    private final CardService cardService;
    private final ChecklistItemService checklistItemService;
    private final UserBoardService userBoardService;

    public DomainOrchestrationService(
            UserService userService,
            BoardService boardService,
            CardService cardService,
            ChecklistItemService checklistItemService,
            UserBoardService userBoardService) {
        this.userService = userService;
        this.boardService = boardService;
        this.cardService = cardService;
        this.checklistItemService = checklistItemService;
        this.userBoardService = userBoardService;
    }

    @Transactional
    public void deleteUser(Long id) {
        userService.getUserById(id);
        cardService.clearUserAssignments(id);
        userBoardService.deleteAllForUser(id);
        userService.deleteUser(id);
    }

    @Transactional
    public void deleteBoard(Long boardId) {
        boardService.getBoardById(boardId);
        userBoardService.deleteAllForBoard(boardId);
        boardService.deleteBoard(boardId);
    }

    @Transactional
    public UserBoardDto deleteUserBoard(UserBoardDto dto) {
        if (dto == null || dto.boardId() == null || dto.userId() == null) {
            throw new IllegalArgumentException("UserBoard invalido.");
        }
        Long boardId = dto.boardId();
        userBoardService.deleteMembership(boardId, dto.userId());
        boolean boardStillHasMembers = userBoardService.boardHasMembers(boardId);
        if (!boardStillHasMembers && boardService.existsById(boardId)) {
            cardService.findEntitiesByBoardId(boardId).forEach(card -> {
                checklistItemService.deleteAllByCardId(card.getId());
                cardService.deleteById(card.getId());
            });
            cardService.flush();
            boardService.deleteBoard(boardId);
        }
        return dto;
    }
}
