import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import { getAllStatuses } from './statusService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('statusService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns normalized statuses sorted by id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        Status: [
          { id: '3', name: ' Doing ', code: 'DOING', description: 'd' },
          { id: 2, name: 'Todo', code: 'TODO' },
          { id: 'invalid', name: 'Skip' },
        ],
      },
    })

    await expect(getAllStatuses()).resolves.toEqual([
      { id: 2, name: 'Todo', code: 'TODO', description: undefined },
      { id: 3, name: 'Doing', code: 'DOING', description: 'd' },
    ])
  })

  it('returns empty list when Status array is missing', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} })

    await expect(getAllStatuses()).resolves.toEqual([])
  })

  it('throws server error message when request fails with status', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('fail', undefined, undefined, undefined, {
        status: 503,
        statusText: 'Unavailable',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(getAllStatuses()).rejects.toThrow('Error del servidor (503)')
  })

  it('throws fallback message when request fails without status', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('offline'))

    await expect(getAllStatuses()).rejects.toThrow('No se pudieron cargar los estados')
  })
})
