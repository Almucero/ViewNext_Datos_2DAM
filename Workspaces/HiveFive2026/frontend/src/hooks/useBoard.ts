import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { createCard, deleteCard, getCardsByBoardId, updateCard } from '../services/cardService'
import type { Card, CardInput } from '../services/cardService'
import { getAllStatuses } from '../services/statusService'
import type { Status } from '../services/statusService'
import type { MessageKey } from '../i18n'

interface StoredUser {
  userId: number
}

interface DraftCardState {
  [statusId: number]: {
    title: string
    description: string
    startDate: string
    endDate: string
    priority: string
  }
}

const EMPTY_DRAFT = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  priority: '1',
}

export default function useBoard(
  boardId: number,
  t: (key: MessageKey, params?: Record<string, string | number>) => string,
) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [openFormStatusId, setOpenFormStatusId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<DraftCardState>({})
  const [creatingStatusId, setCreatingStatusId] = useState<number | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null)
  const [dragOverStatusId, setDragOverStatusId] = useState<number | null>(null)
  const [savingCardId, setSavingCardId] = useState<number | null>(null)

  const currentUser = useMemo<StoredUser | null>(() => {
    const rawUser = localStorage.getItem('user')
    return rawUser ? (JSON.parse(rawUser) as StoredUser) : null
  }, [])

  useEffect(() => {
    if (!boardId) {
      setError(t('boardRequired'))
      setIsLoading(false)
      return
    }

    const loadBoardData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const allStatuses = await getAllStatuses()
        setStatuses(allStatuses)

        const boardCards = await getCardsByBoardId(boardId)
        setCards(boardCards)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t('boardLoadError'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadBoardData()
  }, [boardId, t])

  const cardsByStatus = useMemo(() => {
    return statuses.reduce<Record<number, Card[]>>((groups, status) => {
      const columnCards = cards.filter((card) => card.statusId === status.id)
      // Default ordering within the column:
      // priority 1 first, priority 9 last (tie-breaker by id).
      columnCards.sort((a, b) => (a.priority - b.priority) || (a.id - b.id))
      groups[status.id] = columnCards
      return groups
    }, {})
  }, [cards, statuses])

  const handleDraftChange = (
    statusId: number,
    field: keyof DraftCardState[number],
    value: string,
  ) => {
    setDrafts((previousDrafts) => ({
      ...previousDrafts,
      [statusId]: {
        ...(previousDrafts[statusId] ?? EMPTY_DRAFT),
        [field]: value,
      },
    }))
  }

  const toggleCreateForm = (statusId: number) => {
    setOpenFormStatusId((previousStatusId) => {
      if (previousStatusId === statusId) {
        return null
      }

      setDrafts((previousDrafts) => ({
        ...previousDrafts,
        [statusId]: previousDrafts[statusId] ?? EMPTY_DRAFT,
      }))

      return statusId
    })
  }

  const handleCreateCard = async (statusId: number, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser?.userId) {
      setError(t('noAuthenticatedUser'))
      return
    }

    const draft = drafts[statusId] ?? EMPTY_DRAFT

    const trimmedTitle = draft.title.trim()
    const trimmedDescription = draft.description.trim()

    if (!trimmedTitle || !draft.startDate || !draft.endDate) {
      setError(t('fillRequiredCardFields'))
      return
    }

    if (trimmedTitle.length < 5 || trimmedTitle.length > 40) {
      setError(t('cardTitleMinLength'))
      return
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 70) {
      setError(t('cardDescriptionMinLength'))
      return
    }

    const startMs = new Date(draft.startDate).getTime()
    const endMs = new Date(draft.endDate).getTime()

    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      setError(t('fillRequiredCardFields'))
      return
    }

    if (endMs < startMs) {
      setError(t('cardEndDateBeforeStartDate'))
      return
    }

    setError('')
    setCreatingStatusId(statusId)

    try {
      const priorityValue = Number(draft.priority)
      const clampedPriority = Math.min(9, Math.max(1, Number.isFinite(priorityValue) ? Math.round(priorityValue) : 1))

      const payload: CardInput = {
        title: trimmedTitle,
        description: trimmedDescription,
        startDate: draft.startDate,
        endDate: draft.endDate,
        priority: clampedPriority,
        boardId,
        statusId,
        userId: currentUser.userId,
      }

      const createdCard = await createCard(payload)
      setCards((previousCards) => [...previousCards, createdCard].sort((a, b) => a.id - b.id))
      setDrafts((previousDrafts) => ({
        ...previousDrafts,
        [statusId]: EMPTY_DRAFT,
      }))
      setOpenFormStatusId(null)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('createCardError'))
    } finally {
      setCreatingStatusId(null)
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    setError('')
    setDeletingCardId(cardId)

    try {
      await deleteCard(cardId)
      setCards((previousCards) => previousCards.filter((card) => card.id !== cardId))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t('deleteCardError'))
    } finally {
      setDeletingCardId(null)
    }
  }

  const handleDragStart = (cardId: number, event: DragEvent<HTMLDivElement>) => {
    setDraggingCardId(cardId)
    event.dataTransfer.setData('text/plain', String(cardId))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggingCardId(null)
    setDragOverStatusId(null)
  }

  const handleDragOverColumn = (statusId: number, event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverStatusId(statusId)
  }

  const handleDragDrop = async (statusId: number, event: DragEvent<HTMLElement>) => {
    event.preventDefault()

    if (!currentUser?.userId) {
      setError(t('noAuthenticatedUser'))
      return
    }

    const draggedCardId = Number(event.dataTransfer.getData('text/plain'))
    const draggedCard = cards.find((card) => card.id === draggedCardId)

    setDragOverStatusId(null)
    setDraggingCardId(null)

    if (!draggedCard || draggedCard.statusId === statusId) {
      return
    }

    // Validate card before updating to avoid backend check constraint failures.
    // Some existing cards in DB may not satisfy current UI constraints, and the backend will reject updates.
    const trimmedTitle = draggedCard.title.trim()
    const trimmedDescription = (draggedCard.description ?? '').trim()

    if (trimmedTitle.length < 5 || trimmedTitle.length > 40) {
      setError(t('cardTitleMinLength'))
      return
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 70) {
      setError(t('cardDescriptionMinLength'))
      return
    }

    const startMs = new Date(draggedCard.startDate).getTime()
    const endMs = new Date(draggedCard.endDate).getTime()

    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      setError(t('fillRequiredCardFields'))
      return
    }

    if (endMs < startMs) {
      setError(t('cardEndDateBeforeStartDate'))
      return
    }

    setError('')

    const previousCard = { ...draggedCard }
    const priorityValue = Number(draggedCard.priority)
    const clampedPriority = Math.min(9, Math.max(1, Number.isFinite(priorityValue) ? Math.round(priorityValue) : 1))
    const updatedCard = {
      ...draggedCard,
      statusId,
      boardId,
      title: trimmedTitle,
      description: trimmedDescription,
      priority: clampedPriority,
      userId: currentUser.userId,
    }

    setCards((previousCards) =>
      previousCards.map((card) => (card.id === draggedCardId ? updatedCard : card)),
    )

    try {
      await updateCard(updatedCard)
    } catch (dropError) {
      setCards((previousCards) =>
        previousCards.map((card) => (card.id === draggedCardId ? previousCard : card)),
      )
      setError(dropError instanceof Error ? dropError.message : t('moveCardError'))
    }
  }

  const handleUpdateCard = async (updatedCard: Card) => {
    if (!currentUser?.userId) {
      setError(t('noAuthenticatedUser'))
      return
    }

    setError('')
    setSavingCardId(updatedCard.id)

    try {
      const priorityValue = Number(updatedCard.priority)
      const clampedPriority = Math.min(9, Math.max(1, Number.isFinite(priorityValue) ? Math.round(priorityValue) : 1))
      const sanitizedCard = {
        ...updatedCard,
        boardId,
        priority: clampedPriority,
        userId: currentUser.userId,
      }

      await updateCard(sanitizedCard)
      setCards((previousCards) =>
        previousCards.map((currentCard) => (currentCard.id === updatedCard.id ? sanitizedCard : currentCard)),
      )
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : t('updateCardError')
      setError(message)
      throw new Error(message)
    } finally {
      setSavingCardId(null)
    }
  }

  const clearDragOver = () => setDragOverStatusId(null)
  const closeCreateForm = () => setOpenFormStatusId(null)

  return {
    statuses,
    cards,
    cardsByStatus,
    isLoading,
    error,
    openFormStatusId,
    drafts,
    creatingStatusId,
    deletingCardId,
    draggingCardId,
    dragOverStatusId,
    savingCardId,
    handleDraftChange,
    toggleCreateForm,
    handleCreateCard,
    handleDeleteCard,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDragDrop,
    handleUpdateCard,
    clearDragOver,
    closeCreateForm,
  }
}
