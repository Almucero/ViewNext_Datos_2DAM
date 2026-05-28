import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBoard, deleteBoard, getUserBoards, updateBoard } from '../services/boardService'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { LanguageProvider } from '../i18n'
import Dashboard from './Dashboard'

const mockedNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

vi.mock('../services/boardService', () => ({
  getUserBoards: vi.fn().mockResolvedValue([]),
  createBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem(
      'user',
      JSON.stringify({
        userId: 1,
        email: 'user@test.com',
        firstName: 'Ana',
        lastName: 'Perez',
      }),
    )
  })

  it('shows min-length validation and does not send request for short board names', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <LanguageSwitcher />
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No tienes tableros todavía')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Nombre del tablero'), 'ab')
    await user.click(screen.getByRole('button', { name: 'Crear tablero' }))

    expect(screen.getByText('El nombre del tablero debe tener al menos 3 caracteres')).toBeInTheDocument()
    expect(createBoard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByText('Board name must be at least 3 characters long')).toBeInTheDocument()
  })

  it('re-translates validation error when changing language', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <LanguageSwitcher />
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No tienes tableros todavía')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Crear tablero' }))
    expect(screen.getByText('El nombre del tablero es obligatorio')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByText('Board name is required')).toBeInTheDocument()
  })

  it('refreshes the boards list after creating a new board', async () => {
    const user = userEvent.setup()
    vi.mocked(getUserBoards)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 7, name: 'Nuevo board' }])
    vi.mocked(createBoard).mockResolvedValue({ id: 7, name: 'Nuevo board' })

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No tienes tableros todavía')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Nombre del tablero'), 'Nuevo board')
    await user.click(screen.getByRole('button', { name: 'Crear tablero' }))

    await waitFor(() => {
      expect(screen.getByText('Nuevo board')).toBeInTheDocument()
    })

    expect(createBoard).toHaveBeenCalledWith('Nuevo board', 1)
    expect(getUserBoards).toHaveBeenCalledTimes(2)
    expect(getUserBoards).toHaveBeenNthCalledWith(2, 1)
  })

  it('edits a board name and refreshes boards list', async () => {
    const user = userEvent.setup()
    vi.mocked(getUserBoards)
      .mockResolvedValueOnce([{ id: 7, name: 'Board inicial' }])
      .mockResolvedValueOnce([{ id: 7, name: 'Boardeditado' }])
    vi.mocked(updateBoard).mockResolvedValue({ id: 7, name: 'Boardeditado' })

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Board inicial')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const editInput = screen.getByDisplayValue('Board inicial')
    await user.clear(editInput)
    await user.type(editInput, 'Boardeditado')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Boardeditado')).toBeInTheDocument()
    })

    expect(updateBoard).toHaveBeenCalledWith(7, 'Boardeditado')
    expect(getUserBoards).toHaveBeenCalledTimes(2)
  })

  it('cancels board edit when clicking page background', async () => {
    const user = userEvent.setup()
    vi.mocked(getUserBoards).mockResolvedValueOnce([{ id: 7, name: 'Board inicial' }])

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Board inicial')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByDisplayValue('Board inicial')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()

    await user.click(screen.getByText('Mis tableros'))
    expect(screen.queryByDisplayValue('Board inicial')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('shows centered delete modal and deletes only on confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(getUserBoards).mockResolvedValueOnce([{ id: 9, name: 'Board borrar' }])
    vi.mocked(deleteBoard).mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <LanguageProvider>
          <Dashboard />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Board borrar')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(deleteBoard).not.toHaveBeenCalled()
    expect(screen.getByText('¿Eliminar tablero?')).toBeInTheDocument()
    expect(screen.getByText('Esta accion no se puede deshacer.')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
    await waitFor(() => {
      expect(deleteBoard).toHaveBeenCalledWith(9, 1)
    })
  })
})
