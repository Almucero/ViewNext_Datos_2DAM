import { AxiosError } from 'axios'
import { apiClient } from '../config/api'

export interface Status {
  id: number
  name: string
  code?: string
  description?: string
}

interface StatusResponse {
  Status?: Array<{
    id: number | string
    name: string
    code?: string
    description?: string
  }>
}

function buildErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError && error.response?.status) {
    return `Error del servidor (${error.response.status})`
  }

  return fallbackMessage
}

export async function getAllStatuses() {
  try {
    const response = await apiClient.get<StatusResponse>('/v1/status/get-all')
    const statuses = Array.isArray(response.data?.Status) ? response.data.Status : []

    return statuses
      .map((status) => ({
        id: Number(status.id),
        name: String(status.name ?? '').trim(),
        code: status.code,
        description: status.description,
      }))
      .filter((status) => Number.isFinite(status.id))
      .sort((a, b) => a.id - b.id)
  } catch (error) {
    throw new Error(buildErrorMessage(error, 'No se pudieron cargar los estados'))
  }
}
