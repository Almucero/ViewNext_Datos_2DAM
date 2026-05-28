import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import KanbanCard from '../components/KanbanCard'
import { Search as SearchIcon, Plus as PlusIcon } from 'lucide-react'
import useBoard from '../hooks/useBoard'
import { useLanguage } from '../i18n'
import {
  addUserToBoardByEmail,
  getBoardUsers,
  getUserBoards,
  removeUserFromBoard,
} from '../services/boardService'
import type { BoardUser } from '../services/boardService'

const BOARD_DETAIL_SKELETON_KEY_PREFIX = 'board_detail_skeleton_'

interface BoardDetailSkeletonModel {
  columnCount: number
  cardsPerColumn: number[]
}

function BoardDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t, language } = useLanguage()
  const boardId = useMemo(() => Number(id ?? 0), [id])
  const currentUserId = useMemo(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) {
      return null
    }
    try {
      const parsed = JSON.parse(rawUser) as { userId?: number }
      return Number(parsed.userId ?? 0) || null
    } catch {
      return null
    }
  }, [])
  const [boardName, setBoardName] = useState('')
  const {
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
  } = useBoard(boardId, t)

  const [searchTerm, setSearchTerm] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [isInvitingUser, setIsInvitingUser] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [boardUsers, setBoardUsers] = useState<BoardUser[]>([])
  const [usersError, setUsersError] = useState('')
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [isUsersExpanded, setIsUsersExpanded] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<number | null>(null)
  const [isLeavingBoard, setIsLeavingBoard] = useState(false)
  const [cardPendingDeleteId, setCardPendingDeleteId] = useState<number | null>(null)
  const [skeletonModel, setSkeletonModel] = useState<BoardDetailSkeletonModel>(() => {
    const raw = localStorage.getItem(`${BOARD_DETAIL_SKELETON_KEY_PREFIX}${boardId || 'global'}`)
    if (!raw) {
      return { columnCount: 3, cardsPerColumn: [2, 2, 1] }
    }
    try {
      const parsed = JSON.parse(raw) as Partial<BoardDetailSkeletonModel>
      const parsedColumnCount = Number(parsed.columnCount)
      const normalizedColumnCount = Number.isFinite(parsedColumnCount)
        ? Math.max(0, Math.floor(parsedColumnCount))
        : 0
      const normalizedCards = Array.isArray(parsed.cardsPerColumn)
        ? parsed.cardsPerColumn.map((value) => {
            const parsedValue = Number(value)
            if (!Number.isFinite(parsedValue)) {
              return 1
            }
            return Math.max(0, Math.floor(parsedValue))
          })
        : []
      return {
        columnCount: normalizedColumnCount,
        cardsPerColumn: normalizedCards,
      }
    } catch {
      return { columnCount: 3, cardsPerColumn: [2, 2, 1] }
    }
  })

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  useEffect(() => {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) return

    const parsed = JSON.parse(rawUser) as { userId?: number }
    if (!parsed.userId) return

    void getUserBoards(parsed.userId)
      .then((boards) => {
        const found = boards.find((b) => b.id === boardId)
        setBoardName(found?.name ?? '')
      })
      .catch(() => setBoardName(''))
  }, [boardId])

  const loadBoardUsers = async () => {
    setUsersError('')
    setIsUsersLoading(true)

    try {
      const users = await getBoardUsers(boardId)
      setBoardUsers(
        users.filter((user) => (currentUserId ? Number(user.id) !== Number(currentUserId) : true)),
      )
    } catch (loadError) {
      setUsersError(loadError instanceof Error ? loadError.message : t('boardUsersLoadError'))
    } finally {
      setIsUsersLoading(false)
    }
  }

  useEffect(() => {
    void loadBoardUsers()
  }, [boardId])

  useEffect(() => {
    if (isLoading) {
      return
    }
    const nextModel: BoardDetailSkeletonModel = {
      columnCount: statuses.length,
      cardsPerColumn: statuses.map((status) => cardsByStatus[status.id]?.length ?? 0),
    }
    localStorage.setItem(`${BOARD_DETAIL_SKELETON_KEY_PREFIX}${boardId || 'global'}`, JSON.stringify(nextModel))
    setSkeletonModel(nextModel)
  }, [boardId, isLoading, statuses, cardsByStatus])

  const handleInviteUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = inviteEmail.trim().toLowerCase()
    setInviteError('')
    setInviteSuccess('')

    if (!normalizedEmail) {
      setInviteError(t('fillAllFields'))
      return
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setInviteError(t('invalidEmailFormat'))
      return
    }

    setIsInvitingUser(true)

    try {
      await addUserToBoardByEmail(boardId, normalizedEmail)
      setInviteSuccess(t('boardUserAdded'))
      setInviteEmail('')
      await loadBoardUsers()
    } catch (submitError) {
      if (submitError instanceof Error && submitError.message === 'USER_NOT_FOUND') {
        setInviteError(t('boardUserNotFound'))
      } else if (submitError instanceof Error && submitError.message === 'USER_ALREADY_IN_BOARD') {
        setInviteError(t('boardUserAlreadyLinked'))
      } else {
        setInviteError(submitError instanceof Error ? submitError.message : t('boardAddUserError'))
      }
    } finally {
      setIsInvitingUser(false)
    }
  }

  const openInviteModal = () => {
    setInviteError('')
    setInviteEmail('')
    setIsInviteModalOpen(true)
  }

  const closeInviteModal = () => {
    if (!isInvitingUser) {
      setIsInviteModalOpen(false)
      setInviteError('')
      setInviteEmail('')
    }
  }

  const handleRemoveUser = async (userId: number) => {
    setUsersError('')
    setRemovingUserId(userId)

    try {
      await removeUserFromBoard(boardId, userId)
      await loadBoardUsers()
    } catch (removeError) {
      setUsersError(removeError instanceof Error ? removeError.message : t('boardRemoveUserError'))
    } finally {
      setRemovingUserId(null)
    }
  }

  const handleLeaveBoard = async () => {
    if (!currentUserId) {
      setUsersError(t('noAuthenticatedUser'))
      return
    }

    setUsersError('')
    setIsLeavingBoard(true)

    try {
      await removeUserFromBoard(boardId, currentUserId)
      navigate('/dashboard', { replace: true })
    } catch (leaveError) {
      setUsersError(leaveError instanceof Error ? leaveError.message : t('leaveBoardError'))
    } finally {
      setIsLeavingBoard(false)
    }
  }

  const cardPendingDelete = cardPendingDeleteId
    ? cards.find((card) => card.id === cardPendingDeleteId) ?? null
    : null

  return (
    <main className="board-page">
      <section className="board-detail-shell">
        <header className="board-detail-header">
          <div>
            <h2 className="board-detail-board-name">{boardName || String(boardId || '')}</h2>
          </div>
          <div className="board-header-tools">
            <div className="board-search">
              <SearchIcon size={16} />
              <input
                aria-label={t('searchCards')}
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="button" className="board-delete-button" onClick={openInviteModal}>
              {t('addUserToBoard')}
            </button>
            <button
              type="button"
              className="board-delete-button logout-danger"
              onClick={() => void handleLeaveBoard()}
              disabled={isLeavingBoard}
            >
              {isLeavingBoard ? t('leavingBoard') : t('leaveBoard')}
            </button>
            <Link to="/dashboard" className="dashboard-link-button">
              {t('backToDashboard')}
            </Link>
          </div>
        </header>

        {inviteSuccess ? <p className="auth-message auth-message-success">{inviteSuccess}</p> : null}
        {usersError ? <p className="auth-message auth-message-error">{usersError}</p> : null}

        <section className="board-users-panel">
          <div className="board-users-header">
            <h3>{t('boardUsersTitle')}</h3>
            <button
              type="button"
              className="board-delete-button"
              onClick={() => setIsUsersExpanded((value) => !value)}
            >
              {isUsersExpanded ? t('boardUsersHide') : t('boardUsersShow')}
            </button>
          </div>
          <div
            className={`board-users-content ${isUsersExpanded ? 'board-users-content-expanded' : 'board-users-content-collapsed'}`}
            aria-hidden={!isUsersExpanded}
          >
            {isUsersLoading ? (
              <p>{t('loading')}</p>
            ) : boardUsers.length === 0 ? (
              <p>{t('boardUsersEmpty')}</p>
            ) : (
              <div className="board-users-list">
                {boardUsers.map((user) => (
                  <div key={user.id} className="board-user-row">
                    <div>
                      <strong>{[user.firstName, user.lastName].join(' ').trim() || user.email}</strong>
                      <p>{user.email}</p>
                    </div>
                    <button
                      type="button"
                      className="board-delete-button"
                      onClick={() => void handleRemoveUser(user.id)}
                      disabled={removingUserId === user.id}
                    >
                      {removingUserId === user.id ? t('deleting') : t('removeUserFromBoard')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {error && openFormStatusId === null ? (
          <p className="auth-message auth-message-error">{error}</p>
        ) : null}

        {isLoading ? (
          skeletonModel.columnCount > 0 ? (
            <section className="kanban-scroll" aria-hidden="true">
              <div className="kanban-board">
                {Array.from({ length: skeletonModel.columnCount }).map((_, columnIndex) => {
                  const cardsCount = skeletonModel.cardsPerColumn[columnIndex] ?? 1
                  return (
                    <article key={columnIndex} className="kanban-column kanban-column-skeleton">
                      <div className="kanban-column-header kanban-column-header-skeleton">
                        <div>
                          <div className="kanban-skeleton-column-title" />
                          <div className="kanban-skeleton-column-subtitle" />
                        </div>
                      </div>
                      <div className="kanban-cards">
                        {Array.from({ length: cardsCount }).map((_, cardIndex) => (
                          <div key={cardIndex} className="kanban-card kanban-card-skeleton">
                            <div className="kanban-skeleton-priority" />
                            <div className="kanban-skeleton-actions">
                              <div className="kanban-skeleton-action" />
                              <div className="kanban-skeleton-action" />
                              <div className="kanban-skeleton-action" />
                            </div>
                            <div className="kanban-skeleton-title" />
                            <div className="kanban-skeleton-subtitle" />
                            <div className="kanban-skeleton-date" />
                            <div className="kanban-skeleton-date short" />
                          </div>
                        ))}
                      </div>
                      <div className="kanban-skeleton-add-button" />
                    </article>
                  )
                })}
              </div>
            </section>
          ) : (
            <div className="boards-loading">{t('loading')}</div>
          )
        ) : (
          <section className="kanban-scroll">
            <div className="kanban-board">
              {statuses.map((status) => (
                <article
                  key={status.id}
                  className={`kanban-column ${dragOverStatusId === status.id ? 'kanban-column-drop-target' : ''}`}
                  onDragOver={(event) => handleDragOverColumn(status.id, event)}
                  onDrop={(event) => void handleDragDrop(status.id, event)}
                  onDragLeave={() => {
                    clearDragOver()
                  }}
                >
                  <div className="kanban-column-header">
                    <div>
                      <h2>{status.name}</h2>
                      <p>{t('cardsCount', { count: cardsByStatus[status.id]?.length ?? 0 })}</p>
                    </div>
                    <button
                      type="button"
                      className="kanban-column-add-icon"
                      onClick={() => toggleCreateForm(status.id)}
                      title={t('newCard')}
                    >
                      <PlusIcon size={20} />
                    </button>
                  </div>

                  <div className="kanban-cards">
                    {(cardsByStatus[status.id] ?? [])
                      .filter((card) => {
                        if (!searchTerm.trim()) return true
                        const term = searchTerm.toLowerCase()
                        return (
                          card.title.toLowerCase().includes(term) ||
                          (card.description || '').toLowerCase().includes(term)
                        )
                      })
                      .map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        language={language}
                        t={t}
                        isDragging={draggingCardId === card.id}
                        isDeleting={deletingCardId === card.id}
                        isSaving={savingCardId === card.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onUpdate={handleUpdateCard}
                        onDelete={async (cardId) => {
                          setCardPendingDeleteId(cardId)
                        }}
                      />
                    ))}
                  </div>

                  <button type="button" className="kanban-add-button" onClick={() => toggleCreateForm(status.id)}>
                    {t('newCard')}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        {cardPendingDelete ? (
          <div className="modal-overlay" onClick={() => setCardPendingDeleteId(null)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <h3>{t('deleteCardConfirm')}</h3>
              <p>{t('deleteCardModalDescription')}</p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="dashboard-logout"
                  onClick={() => setCardPendingDeleteId(null)}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  className="auth-button"
                  onClick={() => void handleDeleteCard(cardPendingDelete.id)}
                  disabled={deletingCardId === cardPendingDelete.id}
                >
                  {deletingCardId === cardPendingDelete.id ? t('deleting') : t('delete')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {isInviteModalOpen ? (
          <div className="modal-overlay" onClick={closeInviteModal}>
            <div
              className="modal-card"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <h3>{t('addUserToBoard')}</h3>
              <form className="board-add-user-form" noValidate onSubmit={(event) => void handleInviteUser(event)}>
                <input
                  type="email"
                  aria-label={t('boardUserEmailLabel')}
                  placeholder={t('boardUserEmailPlaceholder')}
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  disabled={isInvitingUser}
                />

                {inviteError ? <p className="auth-message auth-message-error">{inviteError}</p> : null}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="dashboard-logout"
                    onClick={closeInviteModal}
                    disabled={isInvitingUser}
                  >
                    {t('cancel')}
                  </button>
                  <button type="submit" className="auth-button" disabled={isInvitingUser}>
                    {isInvitingUser ? t('addingUserToBoard') : t('addUserToBoard')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      {openFormStatusId !== null ? (
        <div className="modal-overlay" onClick={() => closeCreateForm()}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()} style={{ width: 'min(100%, 420px)' }}>
            <h3>{t('newCard')}</h3>
            <form className="kanban-create-form kanban-create-form-modal" onSubmit={(event) => handleCreateCard(openFormStatusId, event)}>
              {error && openFormStatusId !== null ? <p className="auth-message auth-message-error">{error}</p> : null}
              <input
                type="text"
                placeholder={t('title')}
                value={drafts[openFormStatusId]?.title ?? ''}
                onChange={(event) => handleDraftChange(openFormStatusId, 'title', event.target.value)}
              />
              <textarea
                placeholder={t('description')}
                value={drafts[openFormStatusId]?.description ?? ''}
                onChange={(event) => handleDraftChange(openFormStatusId, 'description', event.target.value)}
                rows={3}
              />
              <div className="kanban-form-grid">
                <div className="kanban-input-group">
                  <label className="kanban-input-label">{t('start')}</label>
                  <input
                    type="date"
                    value={drafts[openFormStatusId]?.startDate ?? ''}
                    onChange={(event) => handleDraftChange(openFormStatusId, 'startDate', event.target.value)}
                  />
                </div>
                <div className="kanban-input-group">
                  <label className="kanban-input-label">{t('end')}</label>
                  <input
                    type="date"
                    value={drafts[openFormStatusId]?.endDate ?? ''}
                    onChange={(event) => handleDraftChange(openFormStatusId, 'endDate', event.target.value)}
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
                      const currentPriority = Number(drafts[openFormStatusId]?.priority ?? '1')
                      const safePriority = Number.isFinite(currentPriority) ? Math.round(currentPriority) : 1
                      handleDraftChange(openFormStatusId, 'priority', String(Math.max(1, safePriority - 1)))
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
                    placeholder={t('priority')}
                    value={drafts[openFormStatusId]?.priority ?? '1'}
                    onChange={(event) => handleDraftChange(openFormStatusId, 'priority', event.target.value)}
                  />
                  <button
                    type="button"
                    className="kanban-priority-stepper"
                    onClick={() => {
                      const currentPriority = Number(drafts[openFormStatusId]?.priority ?? '1')
                      const safePriority = Number.isFinite(currentPriority) ? Math.round(currentPriority) : 1
                      handleDraftChange(openFormStatusId, 'priority', String(Math.min(9, safePriority + 1)))
                    }}
                    aria-label={`${t('priority')} +`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '10px', justifyContent: 'center' }}>
                <button type="button" className="dashboard-logout" onClick={() => closeCreateForm()}>
                  {t('cancel')}
                </button>
                <button type="submit" className="auth-button" disabled={creatingStatusId === openFormStatusId}>
                  {creatingStatusId === openFormStatusId ? t('saving') : t('saveCard')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default BoardDetail
