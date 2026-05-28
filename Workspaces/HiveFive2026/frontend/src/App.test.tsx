import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from './i18n'
import App from './App'

vi.mock('./pages/Login', () => ({ default: () => <div>Login Page</div> }))
vi.mock('./pages/Register', () => ({ default: () => <div>Register Page</div> }))
vi.mock('./pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('./pages/Profile', () => ({ default: () => <div>Profile Page</div> }))
vi.mock('./pages/BoardDetail', () => ({ default: () => <div>Board Detail Page</div> }))

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects root path to login when unauthenticated', () => {
    renderApp('/')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders register route when unauthenticated', () => {
    renderApp('/register')
    expect(screen.getByText('Register Page')).toBeInTheDocument()
  })

  it('redirects protected dashboard to login when unauthenticated', () => {
    renderApp('/dashboard')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders dashboard when user is authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    renderApp('/dashboard')
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('renders profile when user is authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 1 }))
    renderApp('/profile')
    expect(screen.getByText('Profile Page')).toBeInTheDocument()
  })

  it('redirects unknown routes to login when unauthenticated', () => {
    renderApp('/unknown-route')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
