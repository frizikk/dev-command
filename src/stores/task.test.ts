import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from './task'

describe('Task Store', () => {
    beforeEach(() => {
        // Mock global fetch
        vi.stubGlobal('fetch', vi.fn())
        setActivePinia(createPinia())
    })

    it('adds a task and sends it to the API', async () => {
        const store = useTaskStore()
        const mockTask: any = {
            id: 't-test',
            title: 'Store Test',
            completed: false,
            createdAt: Date.now()
        }

        // Mock response for addTask fetch call
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockTask
        } as Response)

        await store.addTask(mockTask)

        expect(store.tasks).toContainEqual(mockTask)
        expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
            method: 'POST'
        }))
    })

    it('toggles task status and updates API', async () => {
        const store = useTaskStore()
        const mockTask = {
            id: 't-toggle',
            title: 'Toggle Me',
            completed: false,
            createdAt: Date.now()
        }
        store.tasks = [mockTask]

        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

        await store.toggleTask('t-toggle')

        expect(store.tasks[0]?.completed).toBe(true)
        expect(fetch).toHaveBeenCalledWith('/api/tasks/t-toggle', expect.objectContaining({
            method: 'PUT'
        }))
    })

    it('deletes a task and calls API', async () => {
        const store = useTaskStore()
        store.tasks = [{ id: 't-del', title: 'Delete Me', completed: false, createdAt: 0 }]

        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

        await store.deleteTask('t-del')

        expect(store.tasks.length).toBe(0)
        expect(fetch).toHaveBeenCalledWith('/api/tasks/t-del', expect.objectContaining({
            method: 'DELETE'
        }))
    })
})
