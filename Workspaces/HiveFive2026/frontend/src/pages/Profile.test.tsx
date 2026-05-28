import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Profile from './Profile'
import { LanguageProvider } from '../i18n'
import { changePassword, getUserById, updateUser } from '../services/userService'

vi.mock('../services/userService', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  changePassword: vi.fn(),
}))

const mockUser = {
  id: 1,
  roleId: 3,
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Lopez',
  password: 'secret',
}

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <LanguageProvider>
        <Routes>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem(
      'user',
      JSON.stringify({
        userId: 1,
        roleId: 3,
        email: 'ana@example.com',
        firstName: 'Ana',
        lastName: 'Lopez',
      }),
    )
    vi.mocked(getUserById).mockResolvedValue(mockUser)
    vi.mocked(updateUser).mockResolvedValue(mockUser)
    vi.mocked(changePassword).mockResolvedValue({ ...mockUser, password: 'newsecret' })
  })

  it('loads profile fields from getUserById', async () => {
    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue('Lopez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ana@example.com')).toBeInTheDocument()
  })

  it('saves profile with empty password to preserve backend password', async () => {
    const user = userEvent.setup()
    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    const firstInput = screen.getByDisplayValue('Ana')
    await user.clear(firstInput)
    await user.type(firstInput, 'Maria')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({
        id: 1,
        roleId: 3,
        email: 'ana@example.com',
        firstName: 'Maria',
        lastName: 'Lopez',
        password: '',
      })
    })
  })

  it('validates that first and last names have at least 3 characters', async () => {
    const user = userEvent.setup()
    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    const firstInput = screen.getByDisplayValue('Ana')
    await user.clear(firstInput)
    await user.type(firstInput, 'Al')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(
        screen.getByText(/Nombre y apellidos deben tener al menos 3 caracteres/i),
      ).toBeInTheDocument()
    })

    expect(updateUser).not.toHaveBeenCalled()
  })

  it('does not call changePassword when new passwords do not match', async () => {
    const user = userEvent.setup()
    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await user.type(screen.getByLabelText(/Contraseña actual/i), 'secret')
    await user.type(screen.getByLabelText(/^Nueva contraseña$/i), 'aaaa')
    await user.type(screen.getByLabelText(/Confirmar nueva contraseña/i), 'bbbb')

    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))

    await waitFor(() => {
      expect(screen.getByText(/Las nuevas contraseñas no coinciden/i)).toBeInTheDocument()
    })

    expect(changePassword).not.toHaveBeenCalled()
    expect(updateUser).not.toHaveBeenCalled()
  })

  it('shows error when current password is incorrect', async () => {
    const user = userEvent.setup()
    vi.mocked(changePassword).mockRejectedValueOnce(new Error('CURRENT_PASSWORD_INCORRECT'))

    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await user.type(screen.getByLabelText(/Contraseña actual/i), 'wrong')
    await user.type(screen.getByLabelText(/^Nueva contraseña$/i), 'newpass1')
    await user.type(screen.getByLabelText(/Confirmar nueva contraseña/i), 'newpass1')

    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))

    await waitFor(() => {
      expect(screen.getByText(/La contraseña actual no es correcta/i)).toBeInTheDocument()
    })

    expect(changePassword).toHaveBeenCalledWith(1, 'wrong', 'newpass1')
  })

  it('closes modal and shows success after password change', async () => {
    const user = userEvent.setup()
    renderProfile()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    await user.type(screen.getByLabelText(/Contraseña actual/i), 'secret')
    await user.type(screen.getByLabelText(/^Nueva contraseña$/i), 'newpass1')
    await user.type(screen.getByLabelText(/Confirmar nueva contraseña/i), 'newpass1')

    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith(1, 'secret', 'newpass1')
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Contraseña actualizada correctamente/i)).toBeInTheDocument()
  })
})
