import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider, useLanguage } from '../i18n'
import type { Card } from '../services/cardService'
import {
  createItem,
  deleteItem,
  getItemsByCardId,
  updateItem,
} from '../services/checklistService'
import KanbanCard from './KanbanCard'

vi.mock('../services/checklistService', () => ({
  getItemsByCardId: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}))

const sampleCard: Card = {
  id: 1,
  title: 'Valid card title',
  description: 'Valid description with enough chars',
  startDate: '2026-01-01',
  endDate: '2026-01-15',
  priority: 3,
  statusId: 1,
  boardId: 1,
  userId: 1,
}

const checklistItem = {
  id: 10,
  cardId: 1,
  text: 'Subtask one',
  completed: false,
  orderIndex: 1,
}

function KanbanCardHarness(
  props: Partial<{
    card: Card
    isDragging: boolean
    isDeleting: boolean
    isSaving: boolean
    onUpdate: (card: Card) => Promise<void>
    onDelete: (cardId: number) => Promise<void>
  }> = {},
) {
  const { language, t } = useLanguage()
  return (
    <KanbanCard
      card={sampleCard}
      language={language}
      t={t}
      isDragging={false}
      isDeleting={false}
      isSaving={false}
      onDragStart={vi.fn()}
      onDragEnd={vi.fn()}
      onUpdate={vi.fn().mockResolvedValue(undefined)}
      onDelete={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />
  )
}

function renderKanbanCard(
  props?: Parameters<typeof KanbanCardHarness>[0],
) {
  return render(
    <LanguageProvider>
      <KanbanCardHarness {...props} />
    </LanguageProvider>,
  )
}

describe('KanbanCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getItemsByCardId).mockResolvedValue([])
  })

  it('renders card summary and toggles subtasks panel', async () => {
    const user = userEvent.setup()
    renderKanbanCard()

    expect(screen.getByRole('heading', { name: 'Valid card title' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))
    await waitFor(() => {
      expect(getItemsByCardId).toHaveBeenCalledWith(1)
    })
    expect(screen.getByText('No hay subtareas todavía.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(screen.getByRole('button', { name: 'Subtareas' })).toBeInTheDocument()
  })

  it('loads checklist items and shows completion count', async () => {
    vi.mocked(getItemsByCardId).mockResolvedValue([
      checklistItem,
      { ...checklistItem, id: 11, text: 'Done task', completed: true, orderIndex: 2 },
    ])

    const user = userEvent.setup()
    renderKanbanCard()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })
    expect(screen.getByText('Subtask one')).toBeInTheDocument()
  })

  it('shows error when checklist load fails', async () => {
    vi.mocked(getItemsByCardId).mockRejectedValue(new Error('load failed'))

    const user = userEvent.setup()
    renderKanbanCard()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))

    await waitFor(() => {
      expect(screen.getByText('load failed')).toBeInTheDocument()
    })
  })

  it('rejects invalid edit payload and accepts valid update', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderKanbanCard({ onUpdate })

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    const titleInput = screen.getByPlaceholderText('Título')
    await user.clear(titleInput)
    await user.type(titleInput, 'abc')

    const form = screen.getByRole('button', { name: 'Guardar' }).closest('form')
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      expect(
        screen.getByText('El título de la tarjeta debe tener entre 5 y 40 caracteres'),
      ).toBeInTheDocument()
    })
    expect(onUpdate).not.toHaveBeenCalled()

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated title ok')

    const descriptionInput = screen.getByPlaceholderText('Descripción')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description long enough')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated title ok',
          description: 'Updated description long enough',
        }),
      )
    })
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('toggles checklist item completed state with rollback on failure', async () => {
    vi.mocked(getItemsByCardId).mockResolvedValue([checklistItem])
    vi.mocked(updateItem)
      .mockResolvedValueOnce({ ...checklistItem, completed: true })
      .mockRejectedValueOnce(new Error('toggle failed'))

    const user = userEvent.setup()
    renderKanbanCard()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))
    await waitFor(() => {
      expect(screen.getByText('Subtask one')).toBeInTheDocument()
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    await waitFor(() => {
      expect(updateItem).toHaveBeenCalledWith(expect.objectContaining({ completed: true }))
    })

    await user.click(checkbox)
    await waitFor(() => {
      expect(screen.getByText('toggle failed')).toBeInTheDocument()
    })
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('creates and deletes checklist items', async () => {
    vi.mocked(getItemsByCardId).mockResolvedValue([checklistItem])
    vi.mocked(createItem).mockResolvedValue({
      id: 12,
      cardId: 1,
      text: 'New subtask',
      completed: false,
      orderIndex: 2,
    })
    vi.mocked(deleteItem).mockResolvedValue(undefined)

    const user = userEvent.setup()
    renderKanbanCard()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))
    await waitFor(() => {
      expect(screen.getByText('Subtask one')).toBeInTheDocument()
    })

    const newSubtaskInput = screen.getByPlaceholderText('Nueva subtarea')
    await user.type(newSubtaskInput, 'New subtask')
    await user.click(screen.getByRole('button', { name: '+' }))

    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'New subtask', cardId: 1 }),
      )
      expect(screen.getByText('New subtask')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: 'x' })
    await user.click(deleteButtons[0])
    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith(10)
    })
  })

  it('does not create subtask when text is empty', async () => {
    vi.mocked(getItemsByCardId).mockResolvedValue([])

    const user = userEvent.setup()
    renderKanbanCard()

    await user.click(screen.getByRole('button', { name: 'Subtareas' }))
    await user.click(screen.getByRole('button', { name: '+' }))

    expect(createItem).not.toHaveBeenCalled()
  })

  it('calls onDelete and adjusts priority with steppers while editing', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderKanbanCard({ onDelete })

    await user.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(onDelete).toHaveBeenCalledWith(1)

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Prioridad +' }))
    await user.click(screen.getByRole('button', { name: 'Prioridad -' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('formats missing dates as no date label', () => {
    renderKanbanCard({
      card: {
        ...sampleCard,
        startDate: '',
        endDate: '',
      },
    })

    expect(screen.getAllByText(/Sin fecha/).length).toBeGreaterThanOrEqual(2)
  })
})
