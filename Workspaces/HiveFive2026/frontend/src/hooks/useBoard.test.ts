import { act, renderHook, waitFor } from '@testing-library/react'
import type { DragEvent, FormEvent } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider, useLanguage } from '../i18n'
import type { Card } from '../services/cardService'
import {
  createCard,
  deleteCard,
  getCardsByBoardId,
  updateCard,
} from '../services/cardService'
import { getAllStatuses } from '../services/statusService'
import useBoard from './useBoard'

vi.mock('../services/cardService', () => ({
  createCard: vi.fn(),
  deleteCard: vi.fn(),
  getCardsByBoardId: vi.fn(),
  updateCard: vi.fn(),
}))

vi.mock('../services/statusService', () => ({
  getAllStatuses: vi.fn(),
}))

const statuses = [
  { id: 1, name: 'Todo', code: undefined, description: undefined },
  { id: 2, name: 'Doing', code: undefined, description: undefined },
]

const validCard: Card = {
  id: 5,
  title: 'Valid card title',
  description: 'Valid description with enough chars',
  startDate: '2026-01-01',
  endDate: '2026-01-15',
  priority: 2,
  statusId: 1,
  boardId: 1,
  userId: 1,
}

function renderUseBoard(boardId: number) {
  return renderHook(
    () => {
      const { t } = useLanguage()
      return useBoard(boardId, t)
    },
    { wrapper: LanguageProvider },
  )
}

function createSubmitEvent(): FormEvent<HTMLFormElement> {
  return { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>
}

function createDragEvent(cardId: number, statusId: number): DragEvent<HTMLElement> {
  return {
    preventDefault: vi.fn(),
    dataTransfer: {
      setData: vi.fn(),
      getData: vi.fn(() => String(cardId)),
      dropEffect: 'move',
      effectAllowed: 'move',
    },
  } as unknown as DragEvent<HTMLElement>
}

describe('useBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    vi.mocked(getAllStatuses).mockResolvedValue(statuses)
    vi.mocked(getCardsByBoardId).mockResolvedValue([validCard])
    vi.mocked(createCard).mockResolvedValue({ ...validCard, id: 6 })
    vi.mocked(deleteCard).mockResolvedValue(undefined)
    vi.mocked(updateCard).mockResolvedValue(validCard)
  })

  it('loads board data successfully', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.statuses).toHaveLength(2)
    expect(result.current.cards).toHaveLength(1)
    expect(result.current.cardsByStatus[1]).toHaveLength(1)
    expect(result.current.error).toBe('')
  })

  it('sets error when board id is missing', async () => {
    const { result } = renderUseBoard(0)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('El tablero no es válido')
    expect(getAllStatuses).not.toHaveBeenCalled()
  })

  it('sets error when loading board data fails', async () => {
    vi.mocked(getAllStatuses).mockRejectedValue(new Error('load failed'))

    const { result } = renderUseBoard(1)

    await waitFor(() => {
      expect(result.current.error).toBe('load failed')
    })
  })

  it('validates create card draft and creates card on valid input', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.toggleCreateForm(1)
      result.current.handleDraftChange(1, 'title', 'abc')
      result.current.handleDraftChange(1, 'description', 'Valid description with enough chars')
      result.current.handleDraftChange(1, 'startDate', '2026-02-01')
      result.current.handleDraftChange(1, 'endDate', '2026-02-10')
    })

    await act(async () => {
      await result.current.handleCreateCard(1, createSubmitEvent())
    })

    expect(result.current.error).toBe(
      'El título de la tarjeta debe tener entre 5 y 40 caracteres',
    )
    expect(createCard).not.toHaveBeenCalled()

    act(() => {
      result.current.handleDraftChange(1, 'title', 'Valid card title')
      result.current.handleDraftChange(1, 'description', 'Valid description with enough chars')
      result.current.handleDraftChange(1, 'startDate', '2026-02-01')
      result.current.handleDraftChange(1, 'endDate', '2026-01-01')
    })

    await act(async () => {
      await result.current.handleCreateCard(1, createSubmitEvent())
    })

    expect(result.current.error).toBe('La fecha fin no puede ser anterior a la fecha inicio')
    expect(createCard).not.toHaveBeenCalled()

    act(() => {
      result.current.handleDraftChange(1, 'endDate', '2026-02-10')
    })

    await act(async () => {
      await result.current.handleCreateCard(1, createSubmitEvent())
    })

    expect(createCard).toHaveBeenCalled()
    expect(result.current.openFormStatusId).toBeNull()
  })

  it('rejects create card when user is not authenticated', async () => {
    localStorage.removeItem('user')
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.toggleCreateForm(1)
      result.current.handleDraftChange(1, 'title', 'Valid card title')
      result.current.handleDraftChange(1, 'description', 'Valid description with enough chars')
      result.current.handleDraftChange(1, 'startDate', '2026-02-01')
      result.current.handleDraftChange(1, 'endDate', '2026-02-10')
    })

    await act(async () => {
      await result.current.handleCreateCard(1, createSubmitEvent())
    })

    expect(result.current.error).toBe('No hay usuario autenticado')
    expect(createCard).not.toHaveBeenCalled()
  })

  it('deletes card and restores error on failure', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.cards).toHaveLength(1))

    await act(async () => {
      await result.current.handleDeleteCard(5)
    })

    expect(result.current.cards).toHaveLength(0)

    vi.mocked(getCardsByBoardId).mockResolvedValue([validCard])
    vi.mocked(deleteCard).mockRejectedValue(new Error('delete failed'))

    const { result: resultAgain } = renderUseBoard(1)
    await waitFor(() => expect(resultAgain.current.cards).toHaveLength(1))

    await act(async () => {
      await resultAgain.current.handleDeleteCard(5)
    })

    expect(resultAgain.current.error).toBe('delete failed')
    expect(resultAgain.current.cards).toHaveLength(1)
  })

  it('moves card across columns and rolls back on update failure', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.cards[0]?.statusId).toBe(1))

    await act(async () => {
      await result.current.handleDragDrop(2, createDragEvent(5, 2))
    })

    expect(updateCard).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, statusId: 2 }),
    )
    expect(result.current.cards[0]?.statusId).toBe(2)

    vi.mocked(updateCard).mockRejectedValueOnce(new Error('move failed'))

    await act(async () => {
      result.current.handleDragStart(5, createDragEvent(5, 1))
      await result.current.handleDragDrop(1, createDragEvent(5, 1))
    })

    expect(result.current.error).toBe('move failed')
    expect(result.current.cards[0]?.statusId).toBe(2)
  })

  it('ignores drag drop when card stays in same column', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDragDrop(1, createDragEvent(5, 1))
    })

    expect(updateCard).not.toHaveBeenCalled()
  })

  it('updates card through handleUpdateCard with success and failure', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.cards).toHaveLength(1))

    await act(async () => {
      await result.current.handleUpdateCard({ ...validCard, priority: 4 })
    })

    expect(updateCard).toHaveBeenCalledWith(
      expect.objectContaining({ priority: 4, userId: 1, boardId: 1 }),
    )

    vi.mocked(updateCard).mockRejectedValueOnce(new Error('save failed'))

    await act(async () => {
      await expect(
        result.current.handleUpdateCard({ ...validCard, priority: 5 }),
      ).rejects.toThrow('save failed')
    })

    expect(result.current.error).toBe('save failed')
  })

  it('manages drag highlight and create form helpers', async () => {
    const { result } = renderUseBoard(1)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.toggleCreateForm(1)
      result.current.handleDragOverColumn(2, createDragEvent(5, 2))
      result.current.clearDragOver()
      result.current.closeCreateForm()
    })

    expect(result.current.openFormStatusId).toBeNull()
    expect(result.current.dragOverStatusId).toBeNull()
  })
})
