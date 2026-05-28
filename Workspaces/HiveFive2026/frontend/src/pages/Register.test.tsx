import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '../i18n'
import Register from './Register'

const mockedNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

const mockedRegister = vi.fn()
const mockedIsValidEmail = vi.fn()
const mockedHasOnlyAlphabeticNames = vi.fn()

vi.mock('../services/authService', () => ({
  register: (...args: unknown[]) => mockedRegister(...args),
  isValidEmail: (...args: unknown[]) => mockedIsValidEmail(...args),
  hasOnlyAlphabeticNames: (...args: unknown[]) => mockedHasOnlyAlphabeticNames(...args),
}))

function renderRegister() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <Register />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockedIsValidEmail.mockReturnValue(true)
    mockedHasOnlyAlphabeticNames.mockReturnValue(true)
    mockedRegister.mockResolvedValue(undefined)
  })

  it('redirects to dashboard when user is already stored', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    renderRegister()
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('shows error when required fields are empty', async () => {
    const user = userEvent.setup()
    renderRegister()

    const form = screen.getByRole('button', { name: 'Crear cuenta' }).closest('form')
    expect(form).not.toBeNull()
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(await screen.findByText('Debes completar todos los campos')).toBeInTheDocument()
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('shows error when names are not alphabetic', async () => {
    mockedHasOnlyAlphabeticNames.mockReturnValue(false)
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Nombre'), 'Ana3')
    await user.type(screen.getByPlaceholderText('Apellido'), 'Lopez')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'ana@test.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Nombre y apellidos solo pueden contener letras')).toBeInTheDocument()
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('shows error when email format is invalid', async () => {
    mockedIsValidEmail.mockReturnValue(false)
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Nombre'), 'Ana')
    await user.type(screen.getByPlaceholderText('Apellido'), 'Lopez')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'user@site.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña'), 'pass123')

    const form = screen.getByRole('button', { name: 'Crear cuenta' }).closest('form')
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(await screen.findByText('El formato del email no es válido')).toBeInTheDocument()
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('registers user and shows success message', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Nombre'), 'Ana')
    await user.type(screen.getByPlaceholderText('Apellido'), 'Lopez')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'ana@test.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        firstName: 'Ana',
        lastName: 'Lopez',
        email: 'ana@test.com',
        password: 'pass123',
      })
    })

    expect(await screen.findByText('Usuario registrado correctamente')).toBeInTheDocument()
  })

  it('shows server error when register fails', async () => {
    mockedRegister.mockRejectedValue(new Error('El usuario ya está registrado'))
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByPlaceholderText('Nombre'), 'Ana')
    await user.type(screen.getByPlaceholderText('Apellido'), 'Lopez')
    await user.type(screen.getByPlaceholderText('tu@email.com'), 'ana@test.com')
    await user.type(screen.getByPlaceholderText('Crea una contraseña'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('El usuario ya está registrado')).toBeInTheDocument()
  })
})
