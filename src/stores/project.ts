import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface Project {
    id: string
    name: string
    color: string
    icon?: string
}

export const useProjectStore = defineStore('project', () => {
    const projects = useLocalStorage<Project[]>('projects', [
        { id: '1', name: 'Work', color: 'blue' },
        { id: '2', name: 'Home', color: 'green' }
    ])

    function addProject(project: Project) {
        projects.value.push(project)
    }

    function deleteProject(id: string) {
        projects.value = projects.value.filter(p => p.id !== id)
    }

    function updateProject(id: string, updates: Partial<Project>) {
        const project = projects.value.find(p => p.id === id)
        if (project) {
            Object.assign(project, updates)
        }
    }

    return { projects, addProject, deleteProject, updateProject }
})
