import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import {
  hasOnlyAlphabeticNames,
  isValidEmail,
  login,
  register,
} from './authService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates email and alphabetic names', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('bad-email')).toBe(false)
    expect(hasOnlyAlphabeticNames('Ana', 'Pérez')).toBe(true)
    expect(hasOnlyAlphabeticNames('Ana3', 'Pérez')).toBe(false)
  })

  it('logs in a valid user with normalized email', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        User: [
          {
            id: 10,
            roleId: 2,
            email: 'USER@MAIL.COM',
            firstName: 'User',
            lastName: 'One',
            password: 'abc123',
          },
        ],
      },
    })

    await expect(login(' user@mail.com ', 'abc123')).resolves.toEqual({
      userId: 10,
      roleId: 2,
      email: 'USER@MAIL.COM',
      firstName: 'User',
      lastName: 'One',
    })
  })

  it('fails login with invalid credentials', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { User: [{ id: 1, roleId: 3, email: 'a@a.com', firstName: 'A', lastName: 'B', password: 'x' }] },
    })

    await expect(login('a@a.com', 'wrong')).rejects.toThrow('Usuario o contraseña incorrectos')
  })

  it('maps axios 401 to invalid credentials message', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('unauthorized', undefined, undefined, undefined, {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
        data: {},
      }),
    )

    await expect(login('a@a.com', 'x')).rejects.toThrow('Usuario o contraseña incorrectos')
  })

  it('registers a new user with next id and trimmed fields', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        User: [{ id: 3, roleId: 3, email: 'already@a.com', firstName: 'A', lastName: 'B', password: 'x' }],
      },
    })
    vi.mocked(apiClient.post).mockResolvedValue({})

    await register({
      firstName: '  John ',
      lastName: ' Doe  ',
      email: ' john@site.com ',
      password: '  pass ',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/v1/users/create', {
      User: [
        {
          id: 4,
          roleId: 3,
          email: 'john@site.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'pass',
        },
      ],
    })
  })

  it('maps non-401 axios errors to server status message on login', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('server', undefined, undefined, undefined, {
        status: 503,
        statusText: 'Unavailable',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(login('a@a.com', 'x')).rejects.toThrow('Error del servidor (503)')
  })

  it('throws fallback message when register fails without mapped status', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [] } })
    vi.mocked(apiClient.post).mockRejectedValue(new Error('network'))

    await expect(
      register({ firstName: 'A', lastName: 'B', email: 'new@test.com', password: 'x' }),
    ).rejects.toThrow('Could not register the user at this time')
  })

  it('rejects duplicate email on register', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        User: [{ id: 1, roleId: 3, email: 'duplicate@site.com', firstName: 'A', lastName: 'B', password: 'x' }],
      },
    })

    await expect(
      register({ firstName: 'A', lastName: 'B', email: ' DUPLICATE@SITE.COM ', password: 'x' }),
    ).rejects.toThrow('El usuario ya está registrado')
  })
})
