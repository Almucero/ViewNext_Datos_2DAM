import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import { createCard, deleteCard, getCardsByBoardId, updateCard } from './cardService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('cardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes cards and filters by board id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        Card: [
          { id: '1', title: 'A', description: '', start_date: '2026-01-01', end_date: '2026-01-02', priority: 1, board_id: 2, status_id: 1, user_id: 9 },
          { id: '2', title: 'B', description: '', startDate: '2026-02-01', endDate: '2026-02-02', priority: 2, boardId: 3, statusId: 1, userId: 9 },
        ],
      },
    })

    await expect(getCardsByBoardId(2)).resolves.toEqual([
      expect.objectContaining({
        id: 1,
        title: 'A',
        boardId: 2,
      }),
    ])
  })

  it('creates card with next id and trimmed title/description', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { Card: [{ id: 5 }] } })
    vi.mocked(apiClient.post).mockResolvedValue({})

    const payload = {
      title: '  Card A ',
      description: ' Desc ',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
      priority: 1,
      boardId: 2,
      statusId: 3,
      userId: 4,
    }

    await expect(createCard(payload)).resolves.toEqual({
      ...payload,
      id: 6,
      title: 'Card A',
      description: 'Desc',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/v1/cards/create', {
      Card: [
        {
          id: 6,
          title: 'Card A',
          description: 'Desc',
          startDate: '2026-01-01',
          endDate: '2026-01-02',
          priority: 1,
          boardId: 2,
          statusId: 3,
          userId: 4,
        },
      ],
    })
  })

  it('updates a card', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({})
    const card = {
      id: 2,
      title: '  T ',
      description: ' D ',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
      priority: 3,
      boardId: 10,
      statusId: 2,
      userId: 7,
    }

    await expect(updateCard(card)).resolves.toEqual(card)
    expect(apiClient.put).toHaveBeenCalledWith('/v1/cards/update', {
      Card: [
        {
          id: 2,
          title: 'T',
          description: 'D',
          startDate: '2026-01-01',
          endDate: '2026-01-02',
          priority: 3,
          boardId: 10,
          statusId: 2,
          userId: 7,
        },
      ],
    })
  })

  it('deletes a card by id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({})
    await expect(deleteCard(9)).resolves.toBeUndefined()
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/cards/delete/9')
  })

  it('throws when loading cards fails', async () => {
    const { AxiosError } = await import('axios')
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('fail', undefined, undefined, undefined, {
        status: 502,
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(getCardsByBoardId(1)).rejects.toThrow('Error del servidor (502)')
  })
})
