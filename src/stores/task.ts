import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface Task {
    id: string
    title: string
    completed: boolean
    projectId?: string
    priority?: 'high' | 'medium' | 'low'
    createdAt: number
    isEditing?: boolean
}

export const useTaskStore = defineStore('task', () => {
    const tasks = useLocalStorage<Task[]>('tasks', [])

    function addTask(task: Task) {
        tasks.value.push(task)
    }

    function toggleTask(id: string) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            task.completed = !task.completed
        }
    }

    function deleteTask(id: string) {
        tasks.value = tasks.value.filter(t => t.id !== id)
    }

    function updateTask(id: string, updates: Partial<Task>) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            Object.assign(task, updates)
        }
    }

    return { tasks, addTask, toggleTask, deleteTask, updateTask }
})
