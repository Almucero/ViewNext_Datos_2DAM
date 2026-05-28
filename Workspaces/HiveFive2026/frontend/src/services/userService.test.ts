import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import { changePassword, getUserById, updateUser, verifyPassword } from './userService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const sampleUser = {
  id: 1,
  roleId: 3,
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Lopez',
  password: 'secret',
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUserById returns first user from API list', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [sampleUser] } })
    await expect(getUserById(1)).resolves.toEqual(sampleUser)
    expect(apiClient.get).toHaveBeenCalledWith('/v1/users/get/1')
  })

  it('getUserById throws when user list is empty', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [] } })
    await expect(getUserById(1)).rejects.toThrow()
  })

  it('updateUser sends payload and returns first user', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { User: [sampleUser] } })
    await expect(updateUser(sampleUser)).resolves.toEqual(sampleUser)
    expect(apiClient.put).toHaveBeenCalledWith('/v1/users/update', { User: [sampleUser] })
  })

  it('verifyPassword compares against loaded user password', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [sampleUser] } })
    await expect(verifyPassword(1, 'secret')).resolves.toBe(true)
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [sampleUser] } })
    await expect(verifyPassword(1, 'wrong')).resolves.toBe(false)
  })

  it('changePassword rejects when current password does not match', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [sampleUser] } })
    await expect(changePassword(1, 'wrong', 'newpass')).rejects.toThrow('CURRENT_PASSWORD_INCORRECT')
    expect(apiClient.put).not.toHaveBeenCalled()
  })

  it('getUserById maps axios status errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('server', undefined, undefined, undefined, {
        status: 503,
        statusText: 'Unavailable',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(getUserById(1)).rejects.toThrow('Error del servidor (503)')
  })

  it('updateUser throws when response list is empty', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { User: [] } })
    await expect(updateUser(sampleUser)).rejects.toThrow('UPDATE_FAILED')
  })

  it('updateUser maps axios status errors', async () => {
    vi.mocked(apiClient.put).mockRejectedValue(
      new AxiosError('server', undefined, undefined, undefined, {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(updateUser(sampleUser)).rejects.toThrow('Error del servidor (400)')
  })

  it('changePassword updates password when current matches', async () => {
    const updated = { ...sampleUser, password: 'newpass' }
    vi.mocked(apiClient.get).mockResolvedValue({ data: { User: [sampleUser] } })
    vi.mocked(apiClient.put).mockResolvedValue({ data: { User: [updated] } })
    await expect(changePassword(1, 'secret', 'newpass')).resolves.toEqual(updated)
    expect(apiClient.put).toHaveBeenCalledWith('/v1/users/update', {
      User: [{ ...sampleUser, password: 'newpass' }],
    })
  })
})
