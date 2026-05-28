import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../config/api'
import {
  addUserToBoardByEmail,
  createBoard,
  deleteBoard,
  getBoardUsers,
  getUserBoards,
  removeUserFromBoard,
  updateBoard,
} from './boardService'

vi.mock('../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('boardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only boards linked to the user', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        data: {
          Board: [
            { id: 1, name: 'One' },
            { id: '2', name: 'Two' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          UserBoard: [
            { userId: 9, boardId: 2 },
            { userId: 8, boardId: 1 },
          ],
        },
      })

    await expect(getUserBoards(9)).resolves.toEqual([{ id: 2, name: 'Two' }])
  })

  it('creates board with next id and user link', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { Board: [{ id: 10, name: 'Board 10' }] },
    })
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(createBoard('  New board  ', 3)).resolves.toEqual({ id: 11, name: 'New board' })

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/v1/boards/create', {
      Board: [{ id: 11, name: 'New board' }],
    })
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/v1/user-boards/create', {
      boardId: 11,
      userId: 3,
    })
  })

  it('rejects board creation without name', async () => {
    await expect(createBoard('   ', 1)).rejects.toThrow('Board name is required')
  })

  it('updates board name', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(updateBoard(8, '  Updated board  ')).resolves.toEqual({ id: 8, name: 'Updated board' })

    expect(apiClient.post).toHaveBeenCalledWith('/v1/boards/update', {
      Board: [{ id: 8, name: 'Updated board' }],
    })
  })

  it('prevents board deletion when board has cards', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { Card: [{ id: 1, boardId: 5 }] },
    })

    await expect(deleteBoard(5, 2)).rejects.toThrow('Cannot delete: the board contains cards')
    expect(apiClient.delete).not.toHaveBeenCalled()
  })

  it('deletes board and link when no cards exist', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { Card: [] } })
    vi.mocked(apiClient.delete).mockResolvedValue({})
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(deleteBoard(4, 2)).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenCalledWith('/v1/user-boards/delete', {
      boardId: 4,
      userId: 2,
    })
    expect(apiClient.delete).toHaveBeenCalledWith('/v1/boards/delete/4')
  })

  it('adds a user to board by email', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        data: {
          User: [
            { id: 7, email: 'one@test.com' },
            { id: 9, email: 'new@test.com' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          UserBoard: [{ userId: 3, boardId: 2 }],
        },
      })
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(addUserToBoardByEmail(2, '  NEW@test.com ')).resolves.toEqual({
      boardId: 2,
      userId: 9,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/v1/user-boards/create', {
      boardId: 2,
      userId: 9,
    })
  })

  it('fails when user email does not exist', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { User: [{ id: 1, email: 'x@test.com' }] } })
      .mockResolvedValueOnce({ data: { UserBoard: [] } })

    await expect(addUserToBoardByEmail(2, 'missing@test.com')).rejects.toThrow('USER_NOT_FOUND')
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('fails when user is already linked to board', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { User: [{ id: 6, email: 'x@test.com' }] } })
      .mockResolvedValueOnce({ data: { UserBoard: [{ userId: 6, boardId: 2 }] } })

    await expect(addUserToBoardByEmail(2, 'x@test.com')).rejects.toThrow('USER_ALREADY_IN_BOARD')
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('lists users linked to a board', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        data: {
          User: [
            { id: 1, email: 'a@test.com', firstName: 'Ana', lastName: 'Lopez' },
            { id: 2, email: 'b@test.com', firstName: 'Bob', lastName: 'Doe' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          UserBoard: [{ userId: 2, boardId: 10 }],
        },
      })

    await expect(getBoardUsers(10)).resolves.toEqual([
      { id: 2, email: 'b@test.com', firstName: 'Bob', lastName: 'Doe' },
    ])
  })

  it('maps axios errors when loading user boards', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new AxiosError('server', undefined, undefined, undefined, {
        status: 500,
        statusText: 'Error',
        headers: {},
        config: {} as never,
        data: {},
      }),
    )

    await expect(getUserBoards(1)).rejects.toThrow('Error del servidor (500)')
  })

  it('removes a linked user from board', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({})

    await expect(removeUserFromBoard(10, 2)).resolves.toBeUndefined()
    expect(apiClient.post).toHaveBeenCalledWith('/v1/user-boards/delete', {
      boardId: 10,
      userId: 2,
    })
  })
})
