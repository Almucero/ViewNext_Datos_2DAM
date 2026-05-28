import { AxiosError } from 'axios'
import { apiClient } from '../config/api'
import type { User } from './authService'

interface UsersResponse {
  User: User[]
}

interface UpdateResponse {
  User: User[]
}

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    if (error.response?.status) {
      return `Error del servidor (${error.response.status})`
    }
  }

  return fallbackMessage
}

export async function getUserById(id: number): Promise<User> {
  try {
    const response = await apiClient.get<UsersResponse>(`/v1/users/get/${id}`)
    const list = response.data?.User
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('USER_NOT_FOUND')
    }
    return list[0]
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      throw error
    }
    throw new Error(buildErrorMessage(error, 'Could not load user'))
  }
}

/**
 * Actualiza el usuario. Si `password` es cadena vacía, el backend conserva la contraseña actual.
 */
export async function updateUser(user: User): Promise<User> {
  try {
    const response = await apiClient.put<UpdateResponse>('/v1/users/update', {
      User: [user],
    })
    const list = response.data?.User
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('UPDATE_FAILED')
    }
    return list[0]
  } catch (error) {
    if (error instanceof Error && error.message === 'UPDATE_FAILED') {
      throw error
    }
    throw new Error(buildErrorMessage(error, 'Could not update user'))
  }
}

export async function verifyPassword(userId: number, currentPassword: string): Promise<boolean> {
  const user = await getUserById(userId)
  return user.password === currentPassword
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<User> {
  const user = await getUserById(userId)
  if (user.password !== currentPassword) {
    throw new Error('CURRENT_PASSWORD_INCORRECT')
  }
  return updateUser({ ...user, password: newPassword.trim() })
}
