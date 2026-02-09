export interface ParsedCommand {
    type: 'task' | 'navigation'
    title?: string
    projectId?: string
    priority?: 'high' | 'medium' | 'low'
    raw: string
}

export const useCommandParser = (input: string): ParsedCommand => {
    const trimmed = input.trim()

    // Navigation commands (starting with /)
    if (trimmed.startsWith('/')) {
        return {
            type: 'navigation',
            raw: trimmed
        }
    }

    // Task parsing
    // Extract Project (#project)
    const projectMatch = trimmed.match(/#(\w+)/)
    const projectId = projectMatch && projectMatch[1] ? projectMatch[1].toLowerCase() : undefined

    // Extract Priority (!high, !medium, !low)
    const priorityMatch = trimmed.match(/!(high|medium|low)/i)
    const priority = priorityMatch && priorityMatch[1] ? (priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low') : undefined

    // Clean title: remove tags
    let title = trimmed
        .replace(/#\w+/g, '')
        .replace(/!(high|medium|low)/i, '')
        .replace(/\s+/g, ' ')
        .trim()

    return {
        type: 'task',
        title,
        projectId,
        priority,
        raw: trimmed
    }
}
