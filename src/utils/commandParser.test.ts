import { describe, it, expect } from 'vitest'
import { useCommandParser } from './commandParser'

describe('useCommandParser', () => {
    it('parses simple task', () => {
        const result = useCommandParser('Buy milk')
        expect(result).toEqual({
            type: 'task',
            title: 'Buy milk',
            projectId: undefined,
            priority: undefined,
            raw: 'Buy milk'
        })
    })

    it('parses project tag', () => {
        const result = useCommandParser('Fix bug #work')
        expect(result).toEqual({
            type: 'task',
            title: 'Fix bug',
            projectId: 'work',
            priority: undefined,
            raw: 'Fix bug #work'
        })
    })

    it('parses priority tag', () => {
        const result = useCommandParser('Urgent fix !high')
        expect(result).toEqual({
            type: 'task',
            title: 'Urgent fix',
            projectId: undefined,
            priority: 'high',
            raw: 'Urgent fix !high'
        })
    })

    it('parses both tags', () => {
        const result = useCommandParser('Deploy #work !low')
        expect(result.projectId).toBe('work')
        expect(result.priority).toBe('low')
        expect(result.title).toBe('Deploy')
    })

    it('parses navigation command', () => {
        const result = useCommandParser('/home')
        expect(result).toEqual({
            type: 'navigation',
            raw: '/home'
        })
    })
})
