import { AxiosError } from 'axios'
import { apiClient } from '../config/api'

export interface ChecklistItem {
  id: number
  cardId: number
  text: string
  completed: boolean
  orderIndex: number
}

export interface ChecklistItemInput {
  cardId: number
  text: string
  completed?: boolean
  orderIndex?: number
}

interface ChecklistItemResponse {
  ChecklistItem?: Array<{
    id: number | string
    cardId: number | string
    text: string
    completed: boolean
    orderIndex: number | string
  }>
}

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError && error.response?.status) {
    return `Error del servidor (${error.response.status})`
  }

  return fallbackMessage
}

function normalizeItems(payload: ChecklistItemResponse | ChecklistItem[] | undefined) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.ChecklistItem)
      ? payload.ChecklistItem
      : []

  return items
    .map((item) => ({
      id: Number(item.id),
      cardId: Number(item.cardId),
      text: String(item.text ?? '').trim(),
      completed: Boolean(item.completed),
      orderIndex: Number(item.orderIndex ?? 0),
    }))
    .filter((item) => Number.isFinite(item.id) && Number.isFinite(item.cardId))
    .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id)
}

async function getAllItems() {
  const response = await apiClient.get<ChecklistItemResponse>('/v1/checklist-items/get-all')
  return normalizeItems(response.data)
}

async function getNextItemId() {
  const items = await getAllItems()
  const maxId = items.reduce((maxValue, item) => Math.max(maxValue, item.id), 0)
  return maxId + 1
}

export async function getItemsByCardId(cardId: number) {
  try {
    const items = await getAllItems()
    return items.filter((item) => item.cardId === cardId)
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudieron cargar las subtareas'))
  }
}

export async function createItem(itemData: ChecklistItemInput) {
  try {
    const nextItemId = await getNextItemId()
    const payload = {
      ChecklistItem: [
        {
          id: nextItemId,
          cardId: itemData.cardId,
          text: itemData.text.trim(),
          completed: Boolean(itemData.completed),
          orderIndex: Number(itemData.orderIndex ?? 1),
        },
      ],
    }

    await apiClient.post('/v1/checklist-items/create', payload)

    return {
      id: nextItemId,
      cardId: itemData.cardId,
      text: itemData.text.trim(),
      completed: Boolean(itemData.completed),
      orderIndex: Number(itemData.orderIndex ?? 1),
    }
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo crear la subtarea'))
  }
}

export async function updateItem(itemData: ChecklistItem) {
  try {
    const payload = {
      ChecklistItem: [
        {
          id: itemData.id,
          cardId: itemData.cardId,
          text: itemData.text.trim(),
          completed: Boolean(itemData.completed),
          orderIndex: Number(itemData.orderIndex),
        },
      ],
    }

    await apiClient.put('/v1/checklist-items/update', payload)
    return itemData
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo actualizar la subtarea'))
  }
}

export async function deleteItem(itemId: number) {
  try {
    await apiClient.delete(`/v1/checklist-items/delete/${itemId}`)
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudo eliminar la subtarea'))
  }
}
