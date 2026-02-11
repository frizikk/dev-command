import { defineStore } from 'pinia'

import { useStorage } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
    const xp = useStorage('devcommand-xp', 0)
    const level = useStorage('devcommand-level', 1)
    const streak = useStorage('devcommand-streak', 0)
    const lastCompletedDate = useStorage('devcommand-last-date', '')
    const frogTaskId = useStorage('devcommand-frog-task-id', '')
    const lastFrogDate = useStorage('devcommand-frog-date', '')

    const xpToNextLevel = (lvl: number) => lvl * 100

    function addXP(amount: number) {
        xp.value += amount
        while (xp.value >= xpToNextLevel(level.value)) {
            xp.value -= xpToNextLevel(level.value)
            level.value++
            // Trigger level up effect logic could be here or in component
        }
    }

    function updateStreak() {
        const today = new Date().toISOString().split('T')[0]
        if (lastCompletedDate.value === today) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (lastCompletedDate.value === yesterdayStr) {
            streak.value++
        } else {
            streak.value = 1
        }
        lastCompletedDate.value = today
    }

    function setFrog(taskId: string) {
        const today = new Date().toISOString().split('T')[0]
        frogTaskId.value = taskId
        lastFrogDate.value = today
    }

    function isFrogPending() {
        const today = new Date().toISOString().split('T')[0]
        if (lastFrogDate.value !== today) return true
        return false
    }

    return { xp, level, streak, frogTaskId, addXP, updateStreak, xpToNextLevel, setFrog, isFrogPending }
})
