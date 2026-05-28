import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '../i18n'
import Login from './Login'

const mockedNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

const mockedLogin = vi.fn()
const mockedIsValidEmail = vi.fn()

vi.mock('../services/authService', () => ({
  login: (...args: unknown[]) => mockedLogin(...args),
  isValidEmail: (...args: unknown[]) => mockedIsValidEmail(...args),
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockedIsValidEmail.mockReturnValue(true)
    mockedLogin.mockResolvedValue({
      userId: 1,
      roleId: 3,
      email: 'user@site.com',
      firstName: 'User',
      lastName: 'One',
    })
  })

  it('toggles password visibility with eye button', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    const passwordInput = screen.getByPlaceholderText('Tu contraseña')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('shows validation error when fields are empty', async () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    const form = screen.getByRole('button', { name: 'Entrar' }).closest('form')
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(await screen.findByText('Debes completar usuario y contraseña')).toBeInTheDocument()
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('shows validation error when email format is invalid', async () => {
    mockedIsValidEmail.mockReturnValue(false)
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'user@site.com')
    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'pass')

    const form = screen.getByRole('button', { name: 'Entrar' }).closest('form')
    form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(await screen.findByText('El email no tiene un formato válido')).toBeInTheDocument()
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('shows error when login fails', async () => {
    mockedLogin.mockRejectedValue(new Error('Usuario o contraseña incorrectos'))
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'user@test.com')
    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Usuario o contraseña incorrectos')).toBeInTheDocument()
  })

  it('redirects to dashboard when session already exists', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('ignores invalid recent emails payload in localStorage', async () => {
    localStorage.setItem('recent-login-emails', 'not-json')
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    expect(document.querySelector('datalist#recent-login-emails')).toBeInTheDocument()
  })

  it('stores successful login email and exposes it in datalist', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LanguageProvider>
          <Login />
        </LanguageProvider>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('tu@email.com'), 'User@Site.com')
    await user.type(screen.getByPlaceholderText('Tu contraseña'), 'pass123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(localStorage.getItem('recent-login-emails')).toContain('user@site.com')
    const option = document.querySelector('datalist#recent-login-emails option[value="user@site.com"]')
    expect(option).not.toBeNull()
  })
})
