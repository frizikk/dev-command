import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Project {
    id: string
    name: string
    color: string
    icon?: string
}

const API_BASE = '/api'

export const useProjectStore = defineStore('project', () => {
    const projects = ref<Project[]>([])

    async function fetchProjects() {
        try {
            const response = await fetch(`${API_BASE}/projects`)
            projects.value = await response.json()
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    }

    async function addProject(project: Project) {
        projects.value.push(project)
        try {
            await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            })
        } catch (error) {
            console.error('Failed to add project:', error)
        }
    }

    async function deleteProject(id: string) {
        projects.value = projects.value.filter(p => p.id !== id)
        try {
            await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' })
        } catch (error) {
            console.error('Failed to delete project:', error)
        }
    }

    function updateProject(id: string, updates: Partial<Project>) {
        const project = projects.value.find(p => p.id === id)
        if (project) {
            Object.assign(project, updates)
            // Implementation for PUT project API could be added here
        }
    }

    return { projects, addProject, deleteProject, updateProject, fetchProjects }
})
