import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from './project'

describe('Project Store', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
        setActivePinia(createPinia())
    })

    it('adds a project and sends it to the API', async () => {
        const store = useProjectStore()
        const mockProject = {
            id: 'p-test',
            name: 'Store Test Project',
            color: 'emerald'
        }

        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => mockProject
        } as Response)

        await store.addProject(mockProject)

        expect(store.projects).toContainEqual(mockProject)
        expect(fetch).toHaveBeenCalledWith('/api/projects', expect.objectContaining({
            method: 'POST'
        }))
    })

    it('deletes a project and calls API', async () => {
        const store = useProjectStore()
        store.projects = [{ id: 'p-del', name: 'Delete Me', color: 'red' }]

        vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

        await store.deleteProject('p-del')

        expect(store.projects.length).toBe(0)
        expect(fetch).toHaveBeenCalledWith('/api/projects/p-del', expect.objectContaining({
            method: 'DELETE'
        }))
    })
})
