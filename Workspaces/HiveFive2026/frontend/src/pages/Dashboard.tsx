import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBoard, deleteBoard, getUserBoards, updateBoard } from '../services/boardService'
import type { Board } from '../services/boardService'
import { useLanguage } from '../i18n'
import type { MessageKey } from '../i18n'
import TiltSurface from '../components/TiltSurface'

const DASHBOARD_LAST_BOARDS_COUNT_KEY = 'dashboard_last_boards_count'
const DASHBOARD_LAST_BOARDS_TEXT_METRICS_KEY = 'dashboard_last_boards_text_metrics'
const DASHBOARD_DEFAULT_SKELETONS = 3

interface StoredUser {
  userId: number
  email: string
  firstName: string
  lastName: string
}

function Dashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null)
  const [createError, setCreateError] = useState('')
  const [createErrorKey, setCreateErrorKey] = useState<MessageKey | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [boardPendingDelete, setBoardPendingDelete] = useState<Board | null>(null)
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null)
  const [editingBoardName, setEditingBoardName] = useState('')
  const [savingBoardId, setSavingBoardId] = useState<number | null>(null)
  const [skeletonCount, setSkeletonCount] = useState<number>(() => {
    const rawCount = localStorage.getItem(DASHBOARD_LAST_BOARDS_COUNT_KEY)
    if (rawCount === null) {
      return DASHBOARD_DEFAULT_SKELETONS
    }
    const parsedCount = Number(rawCount)
    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      return DASHBOARD_DEFAULT_SKELETONS
    }
    return Math.floor(parsedCount)
  })
  const [skeletonTextMetrics, setSkeletonTextMetrics] = useState<{ titleLength: number }>(() => {
    const rawMetrics = localStorage.getItem(DASHBOARD_LAST_BOARDS_TEXT_METRICS_KEY)
    if (!rawMetrics) {
      return { titleLength: 0 }
    }
    try {
      const parsed = JSON.parse(rawMetrics) as { titleLength?: number }
      return {
        titleLength: Number.isFinite(parsed.titleLength) ? Math.max(0, Math.floor(parsed.titleLength as number)) : 0,
      }
    } catch {
      return { titleLength: 0 }
    }
  })

  const currentUser = useMemo<StoredUser | null>(() => {
    const rawUser = localStorage.getItem('user')
    return rawUser ? (JSON.parse(rawUser) as StoredUser) : null
  }, [])

  const setBoardsWithTransition = (updater: Board[] | ((previousBoards: Board[]) => Board[])) => {
    const docWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }
    const startViewTransition = docWithTransition.startViewTransition

    if (typeof startViewTransition === 'function') {
      startViewTransition.call(docWithTransition, () => {
        setBoards(updater)
      })
      return
    }

    setBoards(updater)
  }

  const persistBoardsCount = (count: number) => {
    const normalizedCount = Math.max(0, Math.floor(count))
    localStorage.setItem(DASHBOARD_LAST_BOARDS_COUNT_KEY, String(normalizedCount))
    setSkeletonCount(normalizedCount)
  }

  const persistBoardsSkeletonMetrics = (nextBoards: Board[]) => {
    const titleLength =
      nextBoards.length > 0
        ? Math.round(nextBoards.reduce((total, board) => total + board.name.trim().length, 0) / nextBoards.length)
        : 0
    const nextMetrics = { titleLength }
    localStorage.setItem(DASHBOARD_LAST_BOARDS_TEXT_METRICS_KEY, JSON.stringify(nextMetrics))
    setSkeletonTextMetrics(nextMetrics)
  }

  useEffect(() => {
    if (!currentUser?.userId) {
      navigate('/login', { replace: true })
      return
    }

    const loadBoards = async () => {
      setIsLoading(true)
      setError('')
      setErrorKey(null)

      try {
        const userBoards = await getUserBoards(currentUser.userId)
        setBoardsWithTransition(userBoards)
        persistBoardsCount(userBoards.length)
        persistBoardsSkeletonMetrics(userBoards)
      } catch (loadError) {
        if (loadError instanceof Error) {
          setError(loadError.message)
          setErrorKey(null)
        } else {
          setError('')
          setErrorKey('loadBoardsError')
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadBoards()
  }, [currentUser, navigate, t])

  const handleCreateBoard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser?.userId) {
      navigate('/login', { replace: true })
      return
    }

    const trimmedBoardName = newBoardName.trim()

    if (!trimmedBoardName) {
      setCreateError('')
      setCreateErrorKey('boardNameRequired')
      return
    }

    if (trimmedBoardName.length < 3) {
      setCreateError('')
      setCreateErrorKey('boardNameMinLength')
      return
    }

    setCreateError('')
    setCreateErrorKey(null)
    setIsCreating(true)

    try {
      await createBoard(trimmedBoardName, currentUser.userId)
      const refreshedBoards = await getUserBoards(currentUser.userId)
      setBoardsWithTransition(refreshedBoards)
      persistBoardsCount(refreshedBoards.length)
      persistBoardsSkeletonMetrics(refreshedBoards)
      setNewBoardName('')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setCreateError(submitError.message)
        setCreateErrorKey(null)
      } else {
        setCreateError('')
        setCreateErrorKey('createBoardError')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBoardRequest = (board: Board, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setBoardPendingDelete(board)
  }

  const handleDeleteBoard = async (boardId: number) => {
    if (!currentUser?.userId) {
      navigate('/login', { replace: true })
      return
    }

    setError('')
    setErrorKey(null)
    setPendingDeleteId(boardId)

    try {
      await deleteBoard(boardId, currentUser.userId)
      setBoardsWithTransition((previousBoards) => {
        const updatedBoards = previousBoards.filter((board) => board.id !== boardId)
        persistBoardsCount(updatedBoards.length)
        persistBoardsSkeletonMetrics(updatedBoards)
        return updatedBoards
      })
    } catch (deleteError) {
      if (deleteError instanceof Error) {
        setError(deleteError.message)
        setErrorKey(null)
      } else {
        setError('')
        setErrorKey('deleteBoardError')
      }
    } finally {
      setPendingDeleteId(null)
      setBoardPendingDelete(null)
    }
  }

  const handleOpenBoard = (boardId: number) => {
    if (editingBoardId === boardId) {
      return
    }

    navigate(`/boards/${boardId}`)
  }

  const handleStartEditBoard = (boardId: number, boardName: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setError('')
    setErrorKey(null)
    setEditingBoardId(boardId)
    setEditingBoardName(boardName)
  }

  const handleCancelEditBoard = () => {
    setEditingBoardId(null)
    setEditingBoardName('')
  }

  const handleSaveEditBoard = async (boardId: number) => {
    if (!currentUser?.userId) {
      navigate('/login', { replace: true })
      return
    }

    const trimmedBoardName = editingBoardName.trim()

    if (!trimmedBoardName) {
      setError('')
      setErrorKey('boardNameRequired')
      return
    }

    if (trimmedBoardName.length < 3) {
      setError('')
      setErrorKey('boardNameMinLength')
      return
    }

    try {
      setError('')
      setErrorKey(null)
      setSavingBoardId(boardId)
      await updateBoard(boardId, trimmedBoardName)
      const refreshedBoards = await getUserBoards(currentUser.userId)
      setBoardsWithTransition(refreshedBoards)
      persistBoardsCount(refreshedBoards.length)
      persistBoardsSkeletonMetrics(refreshedBoards)
      setEditingBoardId(null)
      setEditingBoardName('')
    } catch (updateError) {
      if (updateError instanceof Error) {
        setError(updateError.message)
        setErrorKey(null)
      } else {
        setError('')
        setErrorKey('updateBoardError')
      }
    } finally {
      setSavingBoardId(null)
    }
  }

  const handleBoardTitleKeyDown = async (boardId: number, event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      event.preventDefault()
      await handleSaveEditBoard(boardId)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      handleCancelEditBoard()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <main
      className="dashboard-page dashboard-layout"
      onClick={() => {
        if (editingBoardId !== null) {
          handleCancelEditBoard()
        }
      }}
    >
      <section className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <p className="dashboard-kicker">{t('workspace')}</p>
            <h1>{t('welcomeUser', { name: currentUser?.firstName ?? 'usuario' })}</h1>
            <p>{t('dashboardIntro')}</p>
          </div>

          <div className="dashboard-header-actions">
            <button type="button" className="dashboard-logout" onClick={() => navigate('/profile')}>
              {t('myProfile')}
            </button>
            <button type="button" className="dashboard-logout logout-danger" onClick={handleLogout}>
              {t('logout')}
            </button>
          </div>
        </header>

        <section className="board-create-panel">
          <div>
            <h2>{t('newBoard')}</h2>
            <p>{t('newBoardDesc')}</p>
          </div>

          <form className="board-create-form" onSubmit={handleCreateBoard}>
            <input
              type="text"
              value={newBoardName}
              onChange={(event) => setNewBoardName(event.target.value)}
              placeholder={t('boardNamePlaceholder')}
              maxLength={30}
            />
            <button type="submit" className="auth-button profile-primary-button" disabled={isCreating}>
              {isCreating ? t('creatingBoard') : t('createBoard')}
            </button>
          </form>

          {createError || createErrorKey ? (
            <p className="auth-message auth-message-error">
              {createErrorKey ? t(createErrorKey) : createError}
            </p>
          ) : null}
        </section>

        <section className="board-section">
          <div className="board-section-header">
            <div>
              <h2>{t('myBoards')}</h2>
              <p>{t('boardsCount', { count: boards.length })}</p>
            </div>
          </div>

          {error || errorKey ? (
            <p className="auth-message auth-message-error">{errorKey ? t(errorKey) : error}</p>
          ) : null}

          {isLoading ? (
            skeletonCount > 0 ? (
              <div className="boards-grid" aria-hidden="true">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <article key={index} className="board-card board-card-skeleton">
                    <div className="board-skeleton-title-group">
                      <div className="board-skeleton-title" />
                    </div>
                    <p className="board-skeleton-static-open-text">{t('openBoardDetail')}</p>
                    <div className="board-card-actions">
                      <div className="board-skeleton-button" />
                      <div className="board-skeleton-button" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="boards-loading">{t('loading')}</div>
            )
          ) : boards.length === 0 ? (
            <div className="boards-empty">
              <h3>{t('noBoardsYet')}</h3>
              <p>{t('createFirstBoard')}</p>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map((board) => (
                <TiltSurface
                  as="article"
                  key={board.id}
                  className="board-card"
                  style={{ viewTransitionName: `board-card-${board.id}` } as CSSProperties}
                  maxRotateDeg={5.2}
                  maxTranslatePx={3.5}
                  hoverScale={1.02}
                  onClick={() => handleOpenBoard(board.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleOpenBoard(board.id)
                    }
                  }}
                >
                  <div className="board-card-main-wrap">
                    <div
                      className={`board-card-main ${editingBoardId === board.id ? 'board-card-main-hidden' : 'board-card-main-visible'}`}
                      aria-hidden={editingBoardId === board.id}
                    >
                      <h3>{board.name}</h3>
                      <p>{t('openBoardDetail')}</p>
                      <div className="board-card-actions">
                        <button
                          type="button"
                          className="board-delete-button"
                          onClick={(event) => handleStartEditBoard(board.id, board.name, event)}
                          disabled={pendingDeleteId === board.id || savingBoardId === board.id}
                        >
                          {savingBoardId === board.id && editingBoardId === board.id ? t('saving') : t('edit')}
                        </button>
                        <button
                          type="button"
                          className="board-delete-button logout-danger"
                          onClick={(event) => handleDeleteBoardRequest(board, event)}
                          disabled={pendingDeleteId === board.id || savingBoardId === board.id}
                        >
                          {pendingDeleteId === board.id ? t('deleting') : t('delete')}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`board-card-main ${editingBoardId === board.id ? 'board-card-main-visible' : 'board-card-main-hidden'}`}
                      aria-hidden={editingBoardId !== board.id}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        className="board-card-title-input"
                        type="text"
                        value={editingBoardName}
                        onChange={(event) => setEditingBoardName(event.target.value)}
                        onKeyDown={(event) => void handleBoardTitleKeyDown(board.id, event)}
                        placeholder={t('boardNamePlaceholder')}
                        maxLength={30}
                        autoFocus={editingBoardId === board.id}
                      />
                    </div>
                  </div>
                </TiltSurface>
              ))}
            </div>
          )}
        </section>
      </section>
      {boardPendingDelete ? (
        <div className="modal-overlay" onClick={() => setBoardPendingDelete(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>{t('deleteBoardConfirm')}</h3>
            <p>{t('deleteBoardModalDescription')}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="dashboard-logout"
                onClick={() => setBoardPendingDelete(null)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="dashboard-logout logout-danger"
                onClick={() => void handleDeleteBoard(boardPendingDelete.id)}
                disabled={pendingDeleteId === boardPendingDelete.id}
              >
                {pendingDeleteId === boardPendingDelete.id ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default Dashboard
