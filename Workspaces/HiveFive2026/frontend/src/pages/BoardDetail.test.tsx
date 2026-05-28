import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BoardDetail from './BoardDetail'
import { LanguageProvider } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { createCard, getCardsByBoardId } from '../services/cardService'
import {
  addUserToBoardByEmail,
  getBoardUsers,
  getUserBoards,
  removeUserFromBoard,
} from '../services/boardService'
import { getAllStatuses } from '../services/statusService'

vi.mock('../services/cardService', () => ({
  createCard: vi.fn(),
  deleteCard: vi.fn(),
  getCardsByBoardId: vi.fn(),
  updateCard: vi.fn(),
}))

vi.mock('../services/statusService', () => ({
  getAllStatuses: vi.fn(),
}))

vi.mock('../services/boardService', () => ({
  getUserBoards: vi.fn(),
  addUserToBoardByEmail: vi.fn(),
  getBoardUsers: vi.fn(),
  removeUserFromBoard: vi.fn(),
}))

describe('BoardDetail - card validation', () => {
  const statuses = [
    { id: 1, name: 'Todo', code: undefined, description: undefined },
    { id: 2, name: 'Doing', code: undefined, description: undefined },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    vi.mocked(getAllStatuses).mockResolvedValue(statuses)
    vi.mocked(getCardsByBoardId).mockResolvedValue([])
    vi.mocked(getUserBoards).mockResolvedValue([{ id: 1, name: 'Board inicial' }])
    vi.mocked(addUserToBoardByEmail).mockResolvedValue({ boardId: 1, userId: 2 })
    vi.mocked(getBoardUsers).mockResolvedValue([
      { id: 1, email: 'a@test.com', firstName: 'Ana', lastName: 'Lopez' },
    ])
    vi.mocked(removeUserFromBoard).mockResolvedValue(undefined)
  })

  it('validates title length (5..40) in ES/EN and does not send request', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    // Open create form (Spanish button label)
    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'abcd')

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, '1234567890')

    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-10')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-11')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(screen.getByText('El título de la tarjeta debe tener entre 5 y 40 caracteres')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()

    // Switch to English and re-submit to ensure message is translated
    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'Save card' }))

    await waitFor(() => {
      expect(screen.getByText('Card title must be between 5 and 40 characters long')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()
  })

  it('validates description length (10..70) in ES/EN and does not send request', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'abcde')

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, '123456789')

    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-10')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-11')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(screen.getByText('La descripción de la tarjeta debe tener entre 10 y 70 caracteres')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'Save card' }))

    await waitFor(() => {
      expect(screen.getByText('Card description must be between 10 and 70 characters long')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()
  })

  it('validates endDate >= startDate in ES/EN and does not send request', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'abcde')

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, '1234567890')

    // end before start
    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-11')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-10')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(screen.getByText('La fecha fin no puede ser anterior a la fecha inicio')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'Save card' }))

    await waitFor(() => {
      expect(screen.getByText('End date cannot be before start date')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()
  })

  it('allows startDate === endDate and creates card when lengths are valid', async () => {
    const user = userEvent.setup()

    vi.mocked(createCard).mockResolvedValueOnce({
      id: 100,
      title: 'abcde',
      description: '1234567890',
      startDate: '2026-01-10',
      endDate: '2026-01-10',
      priority: 1,
      boardId: 1,
      statusId: 1,
      userId: 1,
    })

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'abcde')

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, '1234567890')

    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-10')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-10')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(createCard).toHaveBeenCalled()
      expect(screen.getByText('abcde')).toBeInTheDocument()
    })
  })

  it('validates title length upper bound (<= 40) in ES/EN and does not send request', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'a'.repeat(41))

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, '1234567890')

    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-10')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-10')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(screen.getByText('El título de la tarjeta debe tener entre 5 y 40 caracteres')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'Save card' }))

    await waitFor(() => {
      expect(screen.getByText('Card title must be between 5 and 40 characters long')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()
  })

  it('validates description length upper bound (<= 70) in ES/EN and does not send request', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Nueva Tarjeta' }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: 'Nueva Tarjeta' })[0])

    const titleInput = screen.getByPlaceholderText('Título')
    const descriptionTextarea = screen.getByPlaceholderText('Descripción')
    const dateInputs = document.querySelectorAll('input[type="date"]')

    await user.clear(titleInput)
    await user.type(titleInput, 'abcde')

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, 'a'.repeat(71))

    await user.clear(dateInputs[0] as HTMLInputElement)
    await user.type(dateInputs[0] as HTMLInputElement, '2026-01-10')
    await user.clear(dateInputs[1] as HTMLInputElement)
    await user.type(dateInputs[1] as HTMLInputElement, '2026-01-10')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(screen.getByText('La descripción de la tarjeta debe tener entre 10 y 70 caracteres')).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    await user.click(screen.getByRole('button', { name: 'Save card' }))

    await waitFor(() => {
      expect(
        screen.getByText('Card description must be between 10 and 70 characters long'),
      ).toBeInTheDocument()
    })
    expect(createCard).not.toHaveBeenCalled()
  })

  it('orders cards inside a column by priority (1 first, 9 last)', async () => {
    const cards = [
      {
        id: 1,
        title: 'p9',
        description: 'desc',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        priority: 9,
        boardId: 1,
        statusId: 1,
        userId: 1,
      },
      {
        id: 2,
        title: 'p1',
        description: 'desc',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        priority: 1,
        boardId: 1,
        statusId: 1,
        userId: 1,
      },
      {
        id: 3,
        title: 'p5',
        description: 'desc',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        priority: 5,
        boardId: 1,
        statusId: 1,
        userId: 1,
      },
    ]

    vi.mocked(getCardsByBoardId).mockResolvedValue(cards)

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('p1')).toBeInTheDocument()
      expect(screen.getByText('p5')).toBeInTheDocument()
      expect(screen.getByText('p9')).toBeInTheDocument()
    })

    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((el) => el.textContent)
      .filter((value): value is string => value === 'p1' || value === 'p5' || value === 'p9')
    expect(titles).toEqual(['p1', 'p5', 'p9'])
  })

  it('adds a user to board by email when email exists', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Agregar usuario' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Email del usuario')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Email del usuario'), 'new@test.com')
    await user.click(screen.getAllByRole('button', { name: 'Agregar usuario' })[1])

    await waitFor(() => {
      expect(addUserToBoardByEmail).toHaveBeenCalledWith(1, 'new@test.com')
    })
    expect(screen.getByText('Usuario agregado al tablero')).toBeInTheDocument()
  })

  it('shows validation error when user email is invalid', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Agregar usuario' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Email del usuario')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Email del usuario'), 'wrong-email')
    await user.click(screen.getAllByRole('button', { name: 'Agregar usuario' })[1])

    expect(addUserToBoardByEmail).not.toHaveBeenCalled()
    expect(screen.getByText('El email no tiene un formato válido')).toBeInTheDocument()
  })

  it('shows not found error in invite modal when user does not exist', async () => {
    const user = userEvent.setup()
    vi.mocked(addUserToBoardByEmail).mockRejectedValueOnce(new Error('USER_NOT_FOUND'))

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Agregar usuario' }))
    await user.type(screen.getByLabelText('Email del usuario'), 'missing@test.com')
    await user.click(screen.getAllByRole('button', { name: 'Agregar usuario' })[1])

    await waitFor(() => {
      expect(screen.getByText('No existe un usuario con ese email')).toBeInTheDocument()
    })
  })

  it('lists board users and allows removing one linked user', async () => {
    const user = userEvent.setup()
    vi.mocked(getBoardUsers).mockResolvedValueOnce([
      { id: 1, email: 'a@test.com', firstName: 'Ana', lastName: 'Lopez' },
      { id: 2, email: 'b@test.com', firstName: 'Bob', lastName: 'Doe' },
    ])
    vi.mocked(getBoardUsers).mockResolvedValueOnce([
      { id: 1, email: 'a@test.com', firstName: 'Ana', lastName: 'Lopez' },
    ])

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <LanguageProvider>
          <LanguageSwitcher />
          <Routes>
            <Route path="/boards/:id" element={<BoardDetail />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Mostrar' }))

    await waitFor(() => {
      expect(screen.getByText('Usuarios del tablero')).toBeInTheDocument()
      expect(screen.getByText('b@test.com')).toBeInTheDocument()
    })
    expect(screen.queryByText('a@test.com')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar' }))

    await waitFor(() => {
      expect(removeUserFromBoard).toHaveBeenCalledWith(1, 2)
    })
  })
})

