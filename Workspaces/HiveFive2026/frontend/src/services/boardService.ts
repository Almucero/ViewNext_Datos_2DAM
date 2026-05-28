import { AxiosError } from 'axios'
import { apiClient } from '../config/api'

export interface Board {
  id: number
  name: string
}

export interface BoardUser {
  id: number
  email: string
  firstName: string
  lastName: string
}

interface BoardResponse {
  Board?: Array<{
    id: number | string
    name: string
  }>
}

interface UserBoardLink {
  userId?: number | string
  user_id?: number | string
  boardId?: number | string
  board_id?: number | string
}

interface UserBoardResponse {
  UserBoard?: UserBoardLink[]
}

interface UserRecord {
  id: number | string
  email?: string
  firstName?: string
  first_name?: string
  lastName?: string
  last_name?: string
}

interface UsersResponse {
  User?: UserRecord[]
}

interface Card {
  id: number
  boardId?: number | string
  board_id?: number | string
  board?: {
    id: number | string
  }
}

interface CardsResponse {
  Card?: Card[]
}

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError && error.response?.status) {
    return `Error del servidor (${error.response.status})`
  }

  return fallbackMessage
}

function normalizeBoards(payload: BoardResponse | Board[] | undefined) {
  const boards = Array.isArray(payload) ? payload : Array.isArray(payload?.Board) ? payload.Board : []

  return boards
    .map((board) => ({
      id: Number(board.id),
      name: String(board.name ?? '').trim(),
    }))
    .filter((board) => Number.isFinite(board.id))
}

function normalizeUserBoardLinks(payload: UserBoardResponse | UserBoardLink[] | undefined) {
  const links = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.UserBoard)
      ? payload.UserBoard
      : []

  return links
    .map((link) => ({
      userId: Number(link.userId ?? link.user_id),
      boardId: Number(link.boardId ?? link.board_id),
    }))
    .filter((link) => Number.isFinite(link.userId) && Number.isFinite(link.boardId))
}

function normalizeCards(payload: CardsResponse | Card[] | undefined) {
  const cards = Array.isArray(payload) ? payload : Array.isArray(payload?.Card) ? payload.Card : []

  return cards.map((card) => ({
    id: Number(card.id),
    boardId: Number(card.board?.id ?? card.boardId ?? card.board_id),
  }))
}

async function getAllBoards() {
  const response = await apiClient.get<BoardResponse>('/v1/boards/get-all')
  return normalizeBoards(response.data)
}

async function getAllUserBoardLinks() {
  const response = await apiClient.get<UserBoardResponse>('/v1/user-boards/get-all')
  return normalizeUserBoardLinks(response.data)
}

async function getAllCards() {
  const response = await apiClient.get<CardsResponse>('/v1/cards/get-all')
  return normalizeCards(response.data)
}

async function getAllUsers() {
  const response = await apiClient.get<UsersResponse>('/v1/users/get-all')
  return Array.isArray(response.data?.User) ? response.data.User : []
}

async function getNextBoardId() {
  const boards = await getAllBoards()
  const maxId = boards.reduce((maxValue, board) => Math.max(maxValue, Number(board.id)), 0)
  return maxId + 1
}

export async function getUserBoards(userId: number) {
  try {
    const [boards, links] = await Promise.all([getAllBoards(), getAllUserBoardLinks()])

    const visibleBoardIds = new Set(
      links.filter((link) => link.userId === userId).map((link) => Number(link.boardId)),
    )

    return boards.filter((board) => visibleBoardIds.has(board.id))
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudieron cargar los tableros'))
  }
}

export async function createBoard(name: string, userId: number) {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error('Board name is required')
  }

  try {
    const nextBoardId = await getNextBoardId()

    await apiClient.post('/v1/boards/create', {
      Board: [
        {
          id: nextBoardId,
          name: trimmedName,
        },
      ],
    })

    await apiClient.post('/v1/user-boards/create', {
      boardId: nextBoardId,
      userId,
    })

    return {
      id: nextBoardId,
      name: trimmedName,
    }
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo crear el tablero'))
  }
}

export async function updateBoard(boardId: number, name: string) {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error('Board name is required')
  }

  try {
    await apiClient.post('/v1/boards/update', {
      Board: [
        {
          id: boardId,
          name: trimmedName,
        },
      ],
    })

    return {
      id: boardId,
      name: trimmedName,
    }
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo actualizar el tablero'))
  }
}

export async function deleteBoard(boardId: number, userId: number) {
  try {
    const cards = await getAllCards()
    const hasCards = cards.some((card) => card.boardId === boardId)

    if (hasCards) {
      throw new Error('BOARD_HAS_CARDS')
    }

    await apiClient.post('/v1/user-boards/delete', {
      boardId,
      userId,
    })
    await apiClient.delete(`/v1/boards/delete/${boardId}`)
  } catch (error) {
    if (error instanceof Error && error.message === 'BOARD_HAS_CARDS') {
      throw new Error('Cannot delete: the board contains cards')
    }

    throw new Error(buildErrorMessage(error, 'No se pudo eliminar el tablero'))
  }
}

export async function addUserToBoardByEmail(boardId: number, email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('EMAIL_REQUIRED')
  }

  try {
    const [users, links] = await Promise.all([getAllUsers(), getAllUserBoardLinks()])

    const targetUser = users.find(
      (user) => String(user.email ?? '').trim().toLowerCase() === normalizedEmail,
    )

    if (!targetUser) {
      throw new Error('USER_NOT_FOUND')
    }

    const targetUserId = Number(targetUser.id)
    const alreadyLinked = links.some(
      (link) => link.boardId === Number(boardId) && link.userId === targetUserId,
    )

    if (alreadyLinked) {
      throw new Error('USER_ALREADY_IN_BOARD')
    }

    await apiClient.post('/v1/user-boards/create', {
      boardId: Number(boardId),
      userId: targetUserId,
    })

    return { boardId: Number(boardId), userId: targetUserId }
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'EMAIL_REQUIRED' ||
        error.message === 'USER_NOT_FOUND' ||
        error.message === 'USER_ALREADY_IN_BOARD')
    ) {
      throw error
    }

    throw new Error(buildErrorMessage(error, 'No se pudo agregar el usuario al tablero'))
  }
}

export async function getBoardUsers(boardId: number): Promise<BoardUser[]> {
  try {
    const [users, links] = await Promise.all([getAllUsers(), getAllUserBoardLinks()])

    const userIdsInBoard = new Set(
      links.filter((link) => link.boardId === Number(boardId)).map((link) => Number(link.userId)),
    )

    return users
      .filter((user) => userIdsInBoard.has(Number(user.id)))
      .map((user) => ({
        id: Number(user.id),
        email: String(user.email ?? '').trim(),
        firstName: String(user.firstName ?? user.first_name ?? '').trim(),
        lastName: String(user.lastName ?? user.last_name ?? '').trim(),
      }))
      .filter((user) => Number.isFinite(user.id))
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudieron cargar los usuarios del tablero'))
  }
}

export async function removeUserFromBoard(boardId: number, userId: number) {
  try {
    await apiClient.post('/v1/user-boards/delete', {
      boardId: Number(boardId),
      userId: Number(userId),
    })
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo eliminar el usuario del tablero'))
  }
}
