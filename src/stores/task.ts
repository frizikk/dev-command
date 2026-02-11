import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'

export interface Task {
    id: string
    title: string
    completed: boolean
    projectId?: string
    priority?: 'high' | 'medium' | 'low'
    createdAt: number
    isEditing?: boolean
}

const API_BASE = '/api'

export const useTaskStore = defineStore('task', () => {
    const tasks = ref<Task[]>([])

    async function fetchTasks() {
        try {
            const response = await fetch(`${API_BASE}/tasks`)
            tasks.value = await response.json()
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }

    async function addTask(task: Task) {
        tasks.value.push(task)
        try {
            await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            })
        } catch (error) {
            console.error('Failed to add task:', error)
        }
    }

    async function toggleTask(id: string) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            task.completed = !task.completed

            if (task.completed) {
                const userStore = useUserStore()
                let xpAward = 10
                if (task.priority === 'high') xpAward = 50
                if (task.priority === 'medium') xpAward = 25

                userStore.addXP(xpAward)
                userStore.updateStreak()
            }

            try {
                await fetch(`${API_BASE}/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: task.completed })
                })
            } catch (error) {
                console.error('Failed to toggle task:', error)
            }
        }
    }

    async function deleteTask(id: string) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        try {
            await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }

    async function updateTask(id: string, updates: Partial<Task>) {
        const task = tasks.value.find(t => t.id === id)
        if (task) {
            Object.assign(task, updates)
            try {
                await fetch(`${API_BASE}/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                })
            } catch (error) {
                console.error('Failed to update task:', error)
            }
        }
    }

    async function breakdownTask(id: string) {
        try {
            const res = await fetch(`${API_BASE}/tasks/${id}/breakdown`, { method: 'POST' })
            if (res.ok) {
                const subtasks = await res.json()
                for (const st of subtasks) {
                    await addTask(st)
                }
            }
        } catch (err) {
            console.error('Failed to breakdown task:', err)
        }
    }

    return { tasks, addTask, toggleTask, deleteTask, updateTask, fetchTasks, breakdownTask }
})
