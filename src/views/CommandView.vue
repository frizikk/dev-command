<template>
  <div class="command-view min-h-screen font-mono flex relative overflow-hidden text-sm">
    <div class="scanlines fixed inset-0 pointer-events-none z-50"></div>
    <CommandPalette v-model="isPaletteOpen" />
    <FocusMode :is-open="isFocusModeOpen" :task="focusedTask" @close="isFocusModeOpen = false" />
    <FrogPrompt :is-open="isFrogPromptOpen" @close="isFrogPromptOpen = false" />


    
    <!-- Sidebar -->
    <aside class="w-72 border-r border-zinc-800/50 bg-zinc-950/90 flex flex-col z-10 backdrop-blur-md">
      <!-- User / System Identity -->
      <div class="p-6 border-b border-zinc-800/50">
         <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-zinc-900 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
             </div>
             <div>
                 <h1 class="font-bold tracking-wider text-zinc-100">DEV.COMMAND</h1>
                 <div class="text-[10px] text-emerald-500/80 uppercase tracking-widest flex items-center gap-1">
                     <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     Online
                 </div>
             </div>
         </div>
         <div class="mt-4 px-1">
             <button @click="isPaletteOpen = true" class="w-full bg-zinc-900 border border-zinc-700/50 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-2">
                 <span>COMMAND PALETTE</span>
                 <span class="bg-zinc-800 px-1 rounded text-zinc-500">⌘K</span>
             </button>
         </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-8">
        <!-- Projects Section -->
        <div>
            <div class="flex items-center justify-between mb-4 pl-2 border-l-2 border-zinc-700">
                <h2 class="text-xs font-bold uppercase text-zinc-500 tracking-widest">Active Operations</h2>
                <span class="text-[10px] text-zinc-600 font-mono">{{ projectStore.projects.length }}</span>
            </div>
            <ul class="space-y-1">
                <li v-for="project in projectStore.projects" :key="project.id" class="group relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-zinc-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded"></div>
                    <a href="#" 
                       @click.prevent="filterProject(project.id)"
                       class="relative flex items-center justify-between px-3 py-2 text-zinc-400 group-hover:text-emerald-400 transition-colors rounded border border-transparent group-hover:border-zinc-800/50"
                       :class="{ '!text-emerald-400 !bg-zinc-900 !border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]': activeProject === project.id }">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono opacity-50">#</span>
                            <span class="uppercase tracking-wide text-xs font-bold">{{ project.name }}</span>
                        </div>
                        <span class="w-1.5 h-1.5 rounded-full" :class="getColorClass(project.color)"></span>
                    </a>
                     <button @click.stop="projectStore.deleteProject(project.id)" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 bg-zinc-950 p-1 rounded z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </li>
            </ul>
        </div>

        <!-- Level System -->
        <LevelSystem />

        <!-- Extra Tools -->
        <div class="px-4">
            <h2 class="text-xs font-bold uppercase text-zinc-500 tracking-widest mb-4 pl-2 border-l-2 border-zinc-700">Protocols</h2>
            <button 
                @click="isOneThingMode = !isOneThingMode"
                class="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded border transition-all"
                :class="isOneThingMode ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'text-zinc-500 border-zinc-800 hover:border-zinc-700'"
            >
                <Target :size="14" />
                {{ isOneThingMode ? 'The One Thing Active' : 'Enable One Thing' }}
            </button>
            <button 
                @click="pickRandomTask"
                class="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded border border-zinc-800 text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-all mt-2"
            >
                <Zap :size="14" />
                Random Easy Win
            </button>
        </div>
      </div>

      
      <!-- System Footer -->
      <div class="p-4 border-t border-zinc-900 bg-zinc-950/50">
          <div class="flex justify-between items-center text-[10px] text-zinc-600 font-mono">
              <span>SYS.VER 1.0.4</span>
              <span>MEM: OK</span>
          </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative z-0">
        <!-- Top Bar -->
      <header class="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur flex items-center justify-between px-8">
        <div class="flex items-center gap-4">
             <div class="text-xs text-zinc-500 uppercase tracking-widest">Current Context</div>
             <div class="text-zinc-200 font-bold tracking-wide flex items-center gap-2">
                 <span class="text-emerald-500">></span>
                 {{ activeProjectName || 'GLOBAL_VIEW' }}
             </div>
        </div>
        <div class="flex items-center gap-6">
            <div @click="isPaletteOpen = true" class="cursor-pointer flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
                <span class="font-bold">CMD + K</span>
                <span>TO EXECUTE</span>
            </div>
             <div class="w-px h-4 bg-zinc-800"></div>
             <div class="text-emerald-500/50 hover:text-emerald-400 cursor-pointer transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             </div>
        </div>
      </header>
      
      <div class="flex-1 overflow-y-auto p-8">
        <!-- Input Area (Terminal Style) -->
        <div class="max-w-4xl mx-auto mb-12">
            <div class="hud-panel p-1 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 ring-offset-2 ring-offset-zinc-950 shadow-2xl transition-shadow focus-within:ring-emerald-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                <div class="bg-zinc-950 rounded flex items-center px-4 py-4 gap-3">
                    <span class="text-emerald-500 font-bold animate-pulse">></span>
                    <input 
                    ref="inputRef"
                    v-model="commandInput"
                    @keydown.enter="handleCommand"
                    type="text" 
                    placeholder="Input command sequence..." 
                    class="flex-1 bg-transparent outline-none text-lg text-emerald-100 placeholder-zinc-700 font-mono tracking-wide"
                    autofocus
                    />
                     <div class="hidden md:flex gap-2 text-[10px] font-mono text-zinc-600 uppercase">
                        <span class="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">#Project</span>
                        <span class="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">!Priority</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Task Grid -->
        <div class="max-w-4xl mx-auto">
            <div v-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center py-20 text-zinc-700 space-y-4">
                <div class="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
                </div>
                <div class="text-xs uppercase tracking-widest opacity-50">Empty Buffer</div>
                <p class="text-[10px] text-zinc-800 italic max-w-xs text-center mt-2">
                    "{{ currentQuote }}"
                </p>
            </div>

            <div v-else class="space-y-1">
                 <div class="flex justify-between items-end mb-2 px-2 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    <span>Task Identifier</span>
                    <span>Status</span>
                </div>
                
                <div v-for="(task, index) in filteredTasks" :key="task.id" 
                        class="group flex items-center p-0.5 rounded transition-all cursor-pointer relative"
                        :class="{ 'z-10 bg-zinc-800/80 scale-[1.01] shadow-lg': index === selectedTaskIndex }"
                        @click="handleToggleTask(task)">

                        
                    <!-- Selection Indicator (Left Border) -->
                    <div class="w-1 self-stretch mr-3 rounded-l transition-colors"
                        :class="[
                            index === selectedTaskIndex ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-zinc-700',
                            task.completed ? 'bg-zinc-800' : ''
                        ]"></div>

                    <div class="flex-1 flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/50 p-3 rounded hover:bg-zinc-900 hover:border-zinc-700 transition-all relative group/item">
                         <!-- Focus Button (Overlay) -->
                        <button 
                            @click.stop="openFocusMode(task)"
                            class="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 transition-all hover:scale-105 z-20"
                        >
                            <Zap :size="10" /> FOCUS
                        </button>

                        <!-- Checkbox Logic -->
                         <div class="w-5 h-5 flex items-center justify-center border transition-colors rounded-sm"
                           :class="task.completed ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-500' : 'border-zinc-700 bg-zinc-950 text-transparent'">
                               <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 w-full">
                                <input v-if="task.isEditing" 
                                    v-model="task.title" 
                                    @blur="stopEditing(task)"
                                    @keydown.enter="stopEditing(task)"
                                    class="bg-transparent outline-none w-full text-zinc-100 font-bold tracking-wide"
                                    autofocus
                                />
                                <div v-else class="flex-1 flex items-center gap-3 overflow-hidden">
                                     <span v-if="userStore.frogTaskId === task.id && !task.completed" 
                                           class="text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                                           title="Your Daily Frog">
                                         🐸
                                     </span>
                                     <span 
                                        :class="[
                                            task.completed ? 'line-through text-zinc-600' : 'text-zinc-200 glow-text-sm',
                                            userStore.frogTaskId === task.id && !task.completed ? 'text-orange-400 font-black' : ''
                                        ]"
                                        class="truncate font-medium tracking-wide"
                                        @dblclick="startEditing(task)">
                                    {{ task.title }}
                                    </span>
                                    <span v-if="task.priority" 
                                          :class="getPriorityClass(task.priority)"
                                          class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border">
                                        {{ task.priority }}
                                    </span>
                                </div>
                            </div>
                        </div>

                         <div class="flex items-center gap-4 text-xs">
                             <span v-if="task.projectId" class="text-zinc-500 font-mono">
                                 #{{ getProjectName(task.projectId) }}
                             </span>
                              <button @click.stop="taskStore.deleteTask(task.id)" class="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { useTaskStore } from '../stores/task'
import { useCommandParser } from '../utils/commandParser'
import { onKeyStroke } from '@vueuse/core'
import type { Task } from '../stores/task'
import CommandPalette from '../components/CommandPalette.vue'
import FocusMode from '../components/FocusMode.vue'
import LevelSystem from '../components/LevelSystem.vue'
import FrogPrompt from '../components/FrogPrompt.vue'
import { Target, Zap } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { useUserStore } from '../stores/user'



const projectStore = useProjectStore()
const taskStore = useTaskStore()

const commandInput = ref<string>('')
const inputRef = ref<HTMLInputElement | null>(null)
const activeProject = ref<string | undefined>(undefined)
const selectedTaskIndex = ref(0)
const isPaletteOpen = ref(false)
const isFocusModeOpen = ref(false)
const focusedTask = ref<Task | null>(null)
const isOneThingMode = ref(false)
const isFrogPromptOpen = ref(false)
const userStore = useUserStore()

const quotes = [
    "The secret of getting ahead is getting started.",
    "Do the hard jobs first. The easy jobs will take care of themselves.",
    "Your future self is watching you right now through memories.",
    "Action is the antidote to anxiety.",
    "Everything you want is on the other side of fear (and boredom).",
    "Don't wait for inspiration. Use the 5-minute rule.",
    "Focus is the art of saying 'no' to 1000 other good ideas."
]

const currentQuote = computed(() => {
    // Rotation based on the hour to keep it stable but fresh
    const hour = new Date().getHours()
    return quotes[hour % quotes.length]
})



onMounted(() => {
    projectStore.fetchProjects()
    taskStore.fetchTasks()
    
    // Check if we need to Eat The Frog
    setTimeout(() => {
        if (userStore.isFrogPending()) {
            isFrogPromptOpen.value = true
        }
    }, 1500)
})


/* Palette handles its own open/close shortcut now */

onKeyStroke(['j', 'ArrowDown'], (e) => {
    if (isPaletteOpen.value) return // Block if palette is open
    if (document.activeElement === inputRef.value) return
    e.preventDefault()
    if (selectedTaskIndex.value < filteredTasks.value.length - 1) {
        selectedTaskIndex.value++
    }
})

onKeyStroke(['k', 'ArrowUp'], (e) => {
    if (isPaletteOpen.value) return // Block if palette is open
    if (document.activeElement === inputRef.value) return
    e.preventDefault()
    if (selectedTaskIndex.value > 0) {
        selectedTaskIndex.value--
    }
})

onKeyStroke('Enter', () => {
    if (document.activeElement === inputRef.value) return
    const task = filteredTasks.value[selectedTaskIndex.value]
    if (task) {
        handleToggleTask(task)
    }
})

function handleToggleTask(task: Task) {
    const wasCompleted = task.completed
    taskStore.toggleTask(task.id)
    
    // Confetti on completion (with 70% chance for variable reward effect)
    if (!wasCompleted && Math.random() > 0.3) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#059669']
        })
    }
}

function openFocusMode(task: Task) {
    focusedTask.value = task
    isFocusModeOpen.value = true
}

function pickRandomTask() {
    const incompleteTasks = taskStore.tasks.filter(t => !t.completed)
    if (incompleteTasks.length > 0) {
        const randomTask = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)]
        if (randomTask) {
            openFocusMode(randomTask)
        }
    }
}


const activeProjectName = computed(() => {
    if (!activeProject.value) return undefined
    return projectStore.projects.find(p => p.id === activeProject.value)?.name
})

const filteredTasks = computed(() => {
    let tasks = taskStore.tasks
    if (activeProject.value) {
        tasks = tasks.filter((t: Task) => t.projectId === activeProject.value)
    }
    // Sort by completion (pending first) then priority
    const sorted = tasks.sort((a: Task, b: Task) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        if (a.priority !== b.priority) {
            const weights = { high: 0, medium: 1, low: 2, undefined: 3 }
            return (weights[a.priority as keyof typeof weights] ?? 3) - (weights[b.priority as keyof typeof weights] ?? 3)
        }
        return 0
    })

    if (isOneThingMode.value) {
        const topTask = sorted.find(t => !t.completed)
        return topTask ? [topTask] : []
    }

    return sorted
})


function handleCommand() {
    if (!commandInput.value) return
    
    const parsed = useCommandParser(commandInput.value)
    
    if (parsed.type === 'navigation') {
        // Handle navigation
        // Maybe switch project?
        console.log('Navigating:', parsed.raw)
    } else {
        // Handle task creation
        let projectId = activeProject.value // Default to current context
        
        if (parsed.projectId) {
            // Find project by name (from tag)
            const found = projectStore.projects.find(p => p.name.toLowerCase() === parsed.projectId?.toLowerCase())
            if (found) {
                projectId = found.id
            } else {
                // Auto-create new project
                const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
                const colors = ['blue', 'green', 'red', 'yellow', 'purple']
                const randomColor = colors[Math.floor(Math.random() * colors.length)] || 'blue'
                
                const newProject = {
                    id: Date.now().toString(),
                    name: capitalize(parsed.projectId),
                    color: randomColor
                }
                projectStore.addProject(newProject)
                projectId = newProject.id
            }
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title: parsed.title || 'Untitled Task',
            completed: false,
            projectId: projectId,
            priority: parsed.priority,
            createdAt: Date.now()
        }
        
        taskStore.addTask(newTask)
    }
    
    commandInput.value = ''
}

function filterProject(id: string) {
    activeProject.value = id
}

function getProjectName(id: string) {
    return projectStore.projects.find(p => p.id === id)?.name || 'Unknown'
}

function getColorClass(color: string) {
    const map: Record<string, string> = {
        blue: 'bg-blue-500', 
        green: 'bg-emerald-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500'
    }
    return map[color] || 'bg-zinc-500'
}

function getPriorityClass(priority: string) {
    const map: Record<string, string> = {
        high: 'text-red-400 border-red-900/50 bg-red-900/10',
        medium: 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10',
        low: 'text-blue-400 border-blue-900/50 bg-blue-900/10'
    }
    return map[priority] || 'text-zinc-400'
}

function startEditing(task: any) {
    task.isEditing = true
}

function stopEditing(task: any) {
    task.isEditing = false
    taskStore.updateTask(task.id, { title: task.title })
}
</script>

<style scoped>
.glow-text-sm {
  text-shadow: 0 0 5px rgba(16, 185, 129, 0.4);
}
</style>
