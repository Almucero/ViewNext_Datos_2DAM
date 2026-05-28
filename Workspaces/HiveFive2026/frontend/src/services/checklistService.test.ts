import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import {
  createItem,
  deleteItem,
  getItemsByCardId,
  updateItem,
} from './checklistService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('checklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns items filtered by card id when payload uses ChecklistItem wrapper', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        ChecklistItem: [
          { id: 1, cardId: 10, text: 'Task A', completed: false, orderIndex: 1 },
          { id: 2, cardId: 20, text: 'Task B', completed: true, orderIndex: 1 },
          { id: 'bad', cardId: 10, text: 'Skip', completed: false, orderIndex: 2 },
        ],
      },
    })

    await expect(getItemsByCardId(10)).resolves.toEqual([
      expect.objectContaining({ id: 1, cardId: 10, text: 'Task A', completed: false }),
    ])
  })

  it('normalizes array payload and sorts by orderIndex then id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: [
        { id: 3, cardId: 5, text: ' Third ', completed: false, orderIndex: 2 },
        { id: 1, cardId: 5, text: 'First', completed: true, orderIndex: 1 },
      ],
    })

    await expect(getItemsByCardId(5)).resolves.toEqual([
      expect.objectContaining({ id: 1, text: 'First', orderIndex: 1 }),
      expect.objectContaining({ id: 3, text: 'Third', orderIndex: 2 }),
    ])
  })

  it('creates item with next id and trimmed text', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { ChecklistItem: [{ id: 4, cardId: 1, text: 'x', completed: false, orderIndex: 1 }] },
    })
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(
      createItem({ cardId: 7, text: '  New task  ', completed: false, orderIndex: 2 }),
    ).resolves.toEqual({
      id: 5,
      cardId: 7,
      text: 'New task',
      completed: false,
      orderIndex: 2,
    })
  })

  it('updates item via put endpoint', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({})
    const item = {
      id: 2,
      cardId: 3,
      text: '  Updated ',
      completed: true,
      orderIndex: 4,
    }

    await expect(updateItem(item)).resolves.toEqual(item)
    expect(apiClient.put).toHaveBeenCalledWith('/v1/checklist-items/update', {
      ChecklistItem: [
        {
          id: 2,
          cardId: 3,
          text: 'Updated',
          completed: true,
          orderIndex: 4,
        },
      ],
    })
  })

  it('deletes item by id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({})
    await expect(deleteItem(9)).resolves.toBeUndefined()
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/checklist-items/delete/9')
  })

  it('throws when loading items fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('server', undefined, undefined, undefined, {
        status: 500,
        statusText: 'Error',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(getItemsByCardId(1)).rejects.toThrow('Error del servidor (500)')
  })

  it('throws fallback message when create fails without status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { ChecklistItem: [] } })
    vi.mocked(apiClient.post).mockRejectedValue(new Error('network'))

    await expect(createItem({ cardId: 1, text: 'Task' })).rejects.toThrow(
      'No se pudo crear la subtarea',
    )
  })
})
