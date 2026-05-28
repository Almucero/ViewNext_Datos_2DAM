import { AxiosError } from 'axios'
import { apiClient } from '../config/api'

export interface User {
  id: number
  roleId: number
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface RegisterUserData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface UsersResponse {
  User: User[]
}

interface RegisterPayload {
  User: User[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_REGEX = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s'-]+$/

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) {
      return 'Usuario o contraseña incorrectos'
    }

    if (error.response?.status) {
      return `Error del servidor (${error.response.status})`
    }
  }

  return fallbackMessage
}

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email)
}

export function hasOnlyAlphabeticNames(firstName: string, lastName: string) {
  return NAME_REGEX.test(firstName) && NAME_REGEX.test(lastName)
}

async function getUsers() {
  const response = await apiClient.get<UsersResponse>('/v1/users/get-all')
  return Array.isArray(response.data?.User) ? response.data.User : []
}

export async function login(email: string, password: string) {
  try {
    const users = await getUsers()
    const normalizedEmail = email.trim().toLowerCase()

    const user = users.find(
      (item) =>
        String(item.email ?? '').trim().toLowerCase() === normalizedEmail &&
        item.password === password,
    )

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    return {
      userId: user.id,
      roleId: user.roleId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      throw new Error('Usuario o contraseña incorrectos')
    }

    throw new Error(buildErrorMessage(error, 'Error connecting to the server'))
  }
}

export async function register(userData: RegisterUserData) {
  try {
    const users = await getUsers()
    const normalizedEmail = userData.email.trim().toLowerCase()

    const alreadyExists = users.some(
      (user) => String(user.email ?? '').trim().toLowerCase() === normalizedEmail,
    )

    if (alreadyExists) {
      throw new Error('DUPLICATE_USER')
    }

    const maxId = users.reduce((maxValue, user) => {
      const numericId = Number(user.id)
      return Number.isFinite(numericId) ? Math.max(maxValue, numericId) : maxValue
    }, 0)

    const payload: RegisterPayload = {
      User: [
        {
          id: maxId + 1,
          roleId: 3,
          email: userData.email.trim(),
          firstName: userData.firstName.trim(),
          lastName: userData.lastName.trim(),
          password: userData.password.trim(),
        },
      ],
    }

    await apiClient.post('/v1/users/create', payload)
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE_USER') {
      throw new Error('El usuario ya está registrado')
    }

    throw new Error(buildErrorMessage(error, 'Could not register the user at this time'))
  }
}
