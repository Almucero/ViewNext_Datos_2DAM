import { AxiosError } from 'axios'
import { apiClient } from '../config/api'

export interface Card {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  priority: number
  boardId: number
  statusId: number
  userId: number
  status?: {
    id: number
    name: string
  }
}

export interface CardInput {
  title: string
  description: string
  startDate: string
  endDate: string
  priority: number
  boardId: number
  statusId: number
  userId: number
}

interface CardResponse {
  Card?: Array<Record<string, unknown>>
}

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError && error.response?.status) {
    return `Error del servidor (${error.response.status})`
  }

  return fallbackMessage
}

function normalizeCard(rawCard: Record<string, unknown>): Card {
  const rawStatus = rawCard.status as Record<string, unknown> | undefined
  const rawBoard = rawCard.board as Record<string, unknown> | undefined
  const rawUser = rawCard.user as Record<string, unknown> | undefined

  return {
    id: Number(rawCard.id ?? 0),
    title: String(rawCard.title ?? ''),
    description: String(rawCard.description ?? ''),
    startDate: String(rawCard.startDate ?? rawCard.start_date ?? ''),
    endDate: String(rawCard.endDate ?? rawCard.end_date ?? ''),
    priority: Number(rawCard.priority ?? 1),
    boardId: Number(rawCard.boardId ?? rawCard.board_id ?? rawBoard?.id ?? 0),
    statusId: Number(rawCard.statusId ?? rawCard.status_id ?? rawStatus?.id ?? 2),
    userId: Number(rawCard.userId ?? rawCard.user_id ?? rawUser?.id ?? 0),
    status: rawStatus
      ? {
          id: Number(rawStatus.id ?? 0),
          name: String(rawStatus.name ?? ''),
        }
      : undefined,
  }
}

async function getAllCards() {
  const response = await apiClient.get<CardResponse>('/v1/cards/get-all')
  const cards = Array.isArray(response.data?.Card) ? response.data.Card : []
  return cards.map((card) => normalizeCard(card))
}

async function getNextCardId() {
  const cards = await getAllCards()
  const maxId = cards.reduce((maxValue, card) => Math.max(maxValue, Number(card.id)), 0)
  return maxId + 1
}

export async function getCardsByBoardId(boardId: number) {
  try {
    const cards = await getAllCards()
    return cards.filter((card) => card.boardId === boardId)
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudieron cargar las tarjetas'))
  }
}

export async function createCard(cardData: CardInput) {
  try {
    const nextCardId = await getNextCardId()

    const payload = {
      Card: [
        {
          id: nextCardId,
          title: cardData.title.trim(),
          description: cardData.description.trim(),
          startDate: cardData.startDate,
          endDate: cardData.endDate,
          priority: Number(cardData.priority),
          boardId: Number(cardData.boardId),
          statusId: Number(cardData.statusId),
          userId: Number(cardData.userId),
        },
      ],
    }

    await apiClient.post('/v1/cards/create', payload)

    return {
      id: nextCardId,
      ...cardData,
      title: cardData.title.trim(),
      description: cardData.description.trim(),
    }
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo crear la tarjeta'))
  }
}

export async function updateCard(cardData: Card) {
  try {
    const payload = {
      Card: [
        {
          id: cardData.id,
          title: cardData.title.trim(),
          description: cardData.description.trim(),
          startDate: cardData.startDate,
          endDate: cardData.endDate,
          priority: Number(cardData.priority),
          boardId: Number(cardData.boardId),
          statusId: Number(cardData.statusId),
          userId: Number(cardData.userId),
        },
      ],
    }

    await apiClient.put('/v1/cards/update', payload)
    return cardData
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo actualizar la tarjeta'))
  }
}

export async function deleteCard(cardId: number) {
  try {
    await apiClient.delete(`/v1/cards/delete/${cardId}`)
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo eliminar la tarjeta'))
  }
}
