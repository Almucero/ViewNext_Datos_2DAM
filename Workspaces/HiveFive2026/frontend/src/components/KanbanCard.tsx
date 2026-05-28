import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { deleteItem, getItemsByCardId, createItem, updateItem } from '../services/checklistService'
import type { ChecklistItem } from '../services/checklistService'
import type { Card } from '../services/cardService'
import type { Language } from '../i18n'
import type { MessageKey } from '../i18n'
import TiltSurface from './TiltSurface'

interface KanbanCardProps {
  card: Card
  language: Language
  t: (key: MessageKey, params?: Record<string, string | number>) => string
  isDragging: boolean
  isDeleting: boolean
  isSaving: boolean
  onDragStart: (cardId: number, event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onUpdate: (card: Card) => Promise<void>
  onDelete: (cardId: number) => Promise<void>
}

const EMPTY_EDIT_DRAFT = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  priority: '1',
}

function KanbanCard({
  card,
  language,
  t,
  isDragging,
  isDeleting,
  isSaving,
  onDragStart,
  onDragEnd,
  onUpdate,
  onDelete,
}: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({
    title: card.title,
    description: card.description,
    startDate: card.startDate,
    endDate: card.endDate,
    priority: String(card.priority),
  })
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [isChecklistLoading, setIsChecklistLoading] = useState(false)
  const [checklistError, setChecklistError] = useState('')
  const [checklistSkeletonCount, setChecklistSkeletonCount] = useState(3)
  const [hasLoadedChecklistOnce, setHasLoadedChecklistOnce] = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

  const shouldShowChecklist = isExpanded || isEditing
  const shouldDisableTilt = isEditing || isExpanded || isCreatingItem

  useEffect(() => {
    setEditDraft({
      title: card.title,
      description: card.description,
      startDate: card.startDate,
      endDate: card.endDate,
      priority: String(card.priority),
    })
  }, [card.description, card.endDate, card.priority, card.startDate, card.title])

  useEffect(() => {
    if (!shouldShowChecklist) {
      return
    }

    const loadChecklist = async () => {
      setIsChecklistLoading(true)
      setChecklistError('')
      setChecklistSkeletonCount((previousCount) => {
        if (hasLoadedChecklistOnce) {
          return Math.max(0, checklistItems.length, previousCount)
        }
        return Math.max(3, checklistItems.length, previousCount)
      })

      try {
        const items = await getItemsByCardId(card.id)
        setChecklistItems(items)
        setChecklistSkeletonCount(items.length)
        setHasLoadedChecklistOnce(true)
      } catch (loadError) {
        setChecklistError(loadError instanceof Error ? loadError.message : t('loadingSubtasks'))
        setHasLoadedChecklistOnce(true)
      } finally {
        setIsChecklistLoading(false)
      }
    }

    void loadChecklist()
  }, [card.id, shouldShowChecklist, t])

  const completedCount = useMemo(
    () => checklistItems.filter((item) => item.completed).length,
    [checklistItems],
  )
  const normalizedPriority = Number.isFinite(card.priority) ? Math.min(9, Math.max(1, Math.round(card.priority))) : 1

  const formatDate = (value: string) => {
    if (!value) {
      return t('noDate')
    }

    return new Date(value).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES')
  }

  const handleEditDraftChange = (
    field: keyof typeof EMPTY_EDIT_DRAFT,
    value: string,
  ) => {
    setEditDraft((previousDraft) => ({
      ...previousDraft,
      [field]: value,
    }))
  }

  const handleUpdateCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = editDraft.title.trim()
    const trimmedDescription = editDraft.description.trim()

    if (!trimmedTitle || !editDraft.startDate || !editDraft.endDate) {
      setChecklistError(t('fillRequiredCardFields'))
      return
    }

    if (trimmedTitle.length < 5 || trimmedTitle.length > 40) {
      setChecklistError(t('cardTitleMinLength'))
      return
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 70) {
      setChecklistError(t('cardDescriptionMinLength'))
      return
    }

    const startMs = new Date(editDraft.startDate).getTime()
    const endMs = new Date(editDraft.endDate).getTime()

    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      setChecklistError(t('fillRequiredCardFields'))
      return
    }

    if (endMs < startMs) {
      setChecklistError(t('cardEndDateBeforeStartDate'))
      return
    }

    setChecklistError('')

    try {
      await onUpdate({
        ...card,
        title: trimmedTitle,
        description: trimmedDescription,
        startDate: editDraft.startDate,
        endDate: editDraft.endDate,
        priority: (() => {
          const priorityValue = Number(editDraft.priority)
          // Normalize to integer so we don't send decimals to the backend.
          const normalizedPriority = Number.isFinite(priorityValue) ? Math.round(priorityValue) : 1
          // Backend/DB constraint: priority allowed only 1..3
          return Math.min(9, Math.max(1, normalizedPriority))
        })(),
      })
      setIsEditing(false)
    } catch (saveError) {
      setChecklistError(saveError instanceof Error ? saveError.message : t('updateCardError'))
    }
  }

  const handleToggleChecklistItem = async (item: ChecklistItem) => {
    const updatedItem = {
      ...item,
      completed: !item.completed,
    }

    setUpdatingItemId(item.id)
    setChecklistError('')
    setChecklistItems((previousItems) =>
      previousItems.map((currentItem) => (currentItem.id === item.id ? updatedItem : currentItem)),
    )

    try {
      await updateItem(updatedItem)
    } catch (updateError) {
      setChecklistItems((previousItems) =>
        previousItems.map((currentItem) => (currentItem.id === item.id ? item : currentItem)),
      )
      setChecklistError(updateError instanceof Error ? updateError.message : t('updateCardError'))
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleCreateItem = async () => {
    if (!newItemText.trim()) {
      return
    }

    const nextOrderIndex = checklistItems.length > 0 ? Math.max(...checklistItems.map((item) => item.orderIndex)) + 1 : 1

    setIsCreatingItem(true)
    setChecklistError('')

    try {
      const createdItem = await createItem({
        cardId: card.id,
        text: newItemText,
        completed: false,
        orderIndex: nextOrderIndex,
      })

      setChecklistItems((previousItems) => [...previousItems, createdItem])
      setChecklistSkeletonCount((previousCount) => Math.max(previousCount, checklistItems.length + 1))
      setNewItemText('')
    } catch (createError) {
      setChecklistError(createError instanceof Error ? createError.message : t('createCardError'))
    } finally {
      setIsCreatingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    setDeletingItemId(itemId)
    setChecklistError('')

    try {
      await deleteItem(itemId)
      setChecklistItems((previousItems) => {
        const nextItems = previousItems.filter((item) => item.id !== itemId)
        setChecklistSkeletonCount(nextItems.length)
        return nextItems
      })
    } catch (deleteError) {
      setChecklistError(deleteError instanceof Error ? deleteError.message : t('deleteCardError'))
    } finally {
      setDeletingItemId(null)
    }
  }

  return (
    <TiltSurface
      className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
      maxRotateDeg={4.8}
      maxTranslatePx={3.2}
      hoverScale={1.016}
      disabled={shouldDisableTilt}
      draggable={!isEditing}
      onDragStart={(event) => onDragStart(card.id, event)}
      onDragEnd={onDragEnd}
    >
      <div className="kanban-card-main-wrap">
        <form
          className={`kanban-create-form kanban-card-main ${isEditing ? 'kanban-card-main-visible' : 'kanban-card-main-hidden'}`}
          onSubmit={handleUpdateCard}
          aria-hidden={!isEditing}
        >
          <input
            type="text"
            placeholder={t('title')}
            value={editDraft.title}
            onChange={(event) => handleEditDraftChange('title', event.target.value)}
          />
          <textarea
            placeholder={t('description')}
            value={editDraft.description}
            onChange={(event) => handleEditDraftChange('description', event.target.value)}
            rows={3}
          />
          <div className="kanban-form-grid">
            <div className="kanban-input-group">
              <label className="kanban-input-label">{t('start')}</label>
              <input
                type="date"
                value={editDraft.startDate}
                onChange={(event) => handleEditDraftChange('startDate', event.target.value)}
              />
            </div>
            <div className="kanban-input-group">
              <label className="kanban-input-label">{t('end')}</label>
              <input
                type="date"
                value={editDraft.endDate}
                onChange={(event) => handleEditDraftChange('endDate', event.target.value)}
              />
            </div>
          </div>
          <div className="kanban-input-group">
            <label className="kanban-input-label">{t('priority')}</label>
            <div className="kanban-priority-input">
              <button
                type="button"
                className="kanban-priority-stepper"
                onClick={() => {
                  const currentPriority = Number(editDraft.priority)
                  const safePriority = Number.isFinite(currentPriority) ? Math.round(currentPriority) : 1
                  handleEditDraftChange('priority', String(Math.max(1, safePriority - 1)))
                }}
                aria-label={`${t('priority')} -`}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="9"
                step="1"
                value={editDraft.priority}
                onChange={(event) => handleEditDraftChange('priority', event.target.value)}
              />
              <button
                type="button"
                className="kanban-priority-stepper"
                onClick={() => {
                  const currentPriority = Number(editDraft.priority)
                  const safePriority = Number.isFinite(currentPriority) ? Math.round(currentPriority) : 1
                  handleEditDraftChange('priority', String(Math.min(9, safePriority + 1)))
                }}
                aria-label={`${t('priority')} +`}
              >
                +
              </button>
            </div>
          </div>
          <div className="kanban-form-actions">
            <button type="submit" className="auth-button" disabled={isSaving}>
              {isSaving ? t('saving') : t('saveChanges')}
            </button>
            <button type="button" className="dashboard-logout" onClick={() => setIsEditing(false)}>
              {t('cancel')}
            </button>
          </div>
        </form>

        <div
          className={`kanban-card-main ${!isEditing ? 'kanban-card-main-visible' : 'kanban-card-main-hidden'}`}
          aria-hidden={isEditing}
        >
          <div className="kanban-card-top">
            <span className={`kanban-priority kanban-priority--p${normalizedPriority}`}>
              {t('priority')} {card.priority}
            </span>
          </div>

          <h3>{card.title}</h3>
          {card.description ? <p>{card.description}</p> : null}

          <div className="kanban-card-dates">
            <span>
              {t('start')}: {formatDate(card.startDate)}
            </span>
            <span>
              {t('end')}: {formatDate(card.endDate)}
            </span>
          </div>

          <div className="kanban-card-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="board-delete-button" onClick={() => setIsEditing(true)}>
              {t('edit')}
            </button>
            <button type="button" className="board-delete-button" onClick={() => setIsExpanded((value) => !value)}>
              {isExpanded ? t('hide') : t('subtasks')}
            </button>
            <button
              type="button"
              className="board-delete-button"
              onClick={() => void onDelete(card.id)}
              disabled={isDeleting}
            >
              {isDeleting ? t('deleting') : t('deleteCard')}
            </button>
          </div>
        </div>
      </div>

      <section
        className={`kanban-checklist ${shouldShowChecklist ? 'kanban-checklist-expanded' : 'kanban-checklist-collapsed'}`}
        aria-hidden={!shouldShowChecklist}
      >
        <div className="kanban-checklist-inner">
          <div className="kanban-checklist-header">
            <h4>{t('subtasks')}</h4>
            <span>
              {completedCount}/{checklistItems.length}
            </span>
          </div>

          {checklistError ? <p className="kanban-checklist-error">{checklistError}</p> : null}

          {isChecklistLoading && checklistSkeletonCount > 0 ? (
            <div className="kanban-checklist-items" aria-hidden="true">
              {Array.from({ length: checklistSkeletonCount }).map((_, index) => (
                <div key={`checklist-skeleton-${card.id}-${index}`} className="kanban-checklist-item kanban-checklist-item-skeleton">
                  <div className="kanban-checklist-skeleton-left">
                    <span className="kanban-checklist-skeleton-box" />
                    <span className="kanban-checklist-skeleton-line" />
                  </div>
                  <span className="kanban-checklist-skeleton-action" />
                </div>
              ))}
            </div>
          ) : isChecklistLoading ? (
            <p className="kanban-checklist-empty">{t('loadingSubtasks')}</p>
          ) : checklistItems.length === 0 ? (
            <p className="kanban-checklist-empty">{t('noSubtasksYet')}</p>
          ) : (
            <div className="kanban-checklist-items">
              {checklistItems.map((item) => (
                <div key={item.id} className="kanban-checklist-item">
                  <label className="kanban-checklist-label">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={updatingItemId === item.id}
                      onChange={() => void handleToggleChecklistItem(item)}
                    />
                    <span className={item.completed ? 'kanban-checklist-text-done' : ''}>{item.text}</span>
                  </label>
                  <button
                    type="button"
                    className="kanban-checklist-delete"
                    onClick={() => void handleDeleteItem(item.id)}
                    disabled={deletingItemId === item.id}
                  >
                    {deletingItemId === item.id ? '...' : 'x'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="kanban-checklist-create">
            <input
              type="text"
              placeholder={t('newSubtask')}
              value={newItemText}
              onChange={(event) => setNewItemText(event.target.value)}
            />
            <button type="button" className="kanban-checklist-add" onClick={() => void handleCreateItem()} disabled={isCreatingItem}>
              {isCreatingItem ? '...' : '+'}
            </button>
          </div>
        </div>
      </section>
    </TiltSurface>
  )
}

export default KanbanCard
