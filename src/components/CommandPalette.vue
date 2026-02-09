<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" @click="close"></div>

    <!-- Palette Window -->
    <div class="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
      
      <!-- Input Area -->
      <div class="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <span class="text-emerald-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
        </span>
        <input 
            ref="inputRef"
            v-model="query"
            type="text" 
            class="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-500 h-10 text-lg font-mono"
            placeholder="Type a command or create task..."
            @keydown.enter="execute"
            @keydown.esc="close"
        />
        <div class="flex gap-2 text-[10px] text-zinc-500 font-mono">
            <span class="border border-zinc-800 rounded px-1.5 py-0.5">ESC</span>
        </div>
      </div>

      <!-- Live Preview / Results -->
      <div class="max-h-[60vh] overflow-y-auto p-2 bg-zinc-900/90">
        
        <!-- Mode: Task Creation Preview -->
        <div v-if="query && !isNavigationCommand" class="p-2 mb-2">
            <div class="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold pl-2">Action: Create Task</div>
            <div class="flex items-center p-3 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-200">
                <div class="w-4 h-4 rounded border-2 border-zinc-600 mr-3"></div>
                <span class="flex-1 font-medium">{{ parsedPreview.title || '...' }}</span>
                <div class="flex gap-2 text-xs">
                    <span v-if="parsedPreview.priority" 
                          class="px-1.5 py-0.5 rounded uppercase font-bold text-[10px] border"
                          :class="getPriorityClass(parsedPreview.priority)">
                        {{ parsedPreview.priority }}
                    </span>
                    <span v-if="parsedPreview.projectId" 
                          class="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800/50 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full" :class="getProjectColorClass(parsedPreview.projectId)"></span>
                        {{ getProjectName(parsedPreview.projectId) }}
                    </span>
                </div>
            </div>
             <div class="mt-2 text-[10px] text-zinc-600 pl-2 flex gap-4">
                <span><b class="text-zinc-500">#project</b> to assign</span>
                <span><b class="text-zinc-500">!priority</b> (high/med/low)</span>
            </div>
        </div>

        <!-- Mode: Navigation / Suggestions -->
        <div v-else>
             <div class="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 mt-2 font-bold pl-2">Suggestions</div>
             <ul class="space-y-1">
                <li v-for="(action, index) in filteredActions" :key="action.id">
                    <button class="w-full text-left flex items-center px-3 py-2 rounded transition-colors group"
                            :class="{ 'bg-zinc-800 text-white': index === selectedIndex, 'text-zinc-400 hover:bg-zinc-800 hover:text-white': index !== selectedIndex }"
                            @click="triggerAction(action)">
                        <component :is="action.icon" class="w-4 h-4 mr-3 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                        <span>{{ action.name }}</span>
                        <span v-if="action.shortcut" class="ml-auto text-[10px] text-zinc-600 border border-zinc-800 rounded px-1">{{ action.shortcut }}</span>
                    </button>
                </li>
             </ul>
        </div>

      </div>

      <!-- Footer Help -->
      <div class="p-2 border-t border-zinc-800 bg-zinc-950/50 text-[10px] text-zinc-600 flex justify-between px-4">
          <span>DevCommand Palette v2.0</span>
          <span class="text-zinc-500">Enter to select</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useCommandParser } from '../utils/commandParser'
import { useProjectStore } from '../stores/project'
import { useTaskStore } from '../stores/task'
import { useMagicKeys, whenever } from '@vueuse/core'

/* Icons */
const IconHash = { template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>` }
const IconLayout = { template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>` }

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const projectStore = useProjectStore()
const taskStore = useTaskStore()

/* Focus Management */
watch(isOpen, async (val) => {
    if (val) {
        query.value = ''
        await nextTick()
        inputRef.value?.focus()
    }
})

const { Meta_K, Ctrl_K, Escape } = useMagicKeys()
whenever(() => Meta_K.value || Ctrl_K.value, () => {
    isOpen.value = !isOpen.value
})

whenever(() => Escape?.value, () => {
    isOpen.value = false
})

/* Parsing Logic */
const parsedPreview = computed(() => useCommandParser(query.value))
const isNavigationCommand = computed(() => query.value.trim().startsWith('>'))

/* Actions System */
const actions = computed(() => [
    { id: 'home', name: 'Go to Dashboard', icon: IconLayout, handler: () => console.log('Nav Home'), shortcut: 'G H' },
    ...projectStore.projects.map(p => ({
        id: `proj-${p.id}`,
        name: `Go to ${p.name}`,
        icon: IconHash,
        handler: () => { /* Select Project */ },
        shortcut: undefined
    }))
])

const filteredActions = computed(() => {
    // If empty query, show all
    if (!query.value) return actions.value
    // If navigation mode
    return actions.value.filter(a => a.name.toLowerCase().includes(query.value.replace('>', '').trim().toLowerCase()))
})

const selectedIndex = ref(0) 

watch(filteredActions, () => {
    selectedIndex.value = 0
})

const { ArrowDown, ArrowUp, Enter } = useMagicKeys()

whenever(() => ArrowDown?.value, () => {
  if (!isOpen.value) return
  if (filteredActions.value.length > 0) {
    selectedIndex.value = (selectedIndex.value + 1) % filteredActions.value.length
  }
})

whenever(() => ArrowUp?.value, () => {
  if (!isOpen.value) return
  if (filteredActions.value.length > 0) {
      selectedIndex.value = (selectedIndex.value - 1 + filteredActions.value.length) % filteredActions.value.length
  }
})

whenever(() => Enter?.value, () => {
    if (!isOpen.value) return
    execute()
})

function execute() {
    if (!query.value && filteredActions.value.length > 0) {
         // Empty query but we have actions? Execute selected
        const action = filteredActions.value[selectedIndex.value]
        if (action) {
            triggerAction(action)
            return
        }
    }
    
    if (!query.value) return

    if (isNavigationCommand.value) {
        const action = filteredActions.value[selectedIndex.value]
        if (action) {
            triggerAction(action)
            return
        }
    } else {
        // Create Task
        handleTaskCreation()
    }
    close()
}

function handleTaskCreation() {
    const parsed = parsedPreview.value
    let projectId = undefined
    
    // Resolve Project
    if (parsed.projectId) {
         const found = projectStore.projects.find(p => p.name.toLowerCase() === parsed.projectId?.toLowerCase())
         if (found) {
             projectId = found.id
         } else {
             // Quick Create Project
            const colors = ['blue', 'green', 'red', 'yellow', 'purple']
            const randomColor = colors[Math.floor(Math.random() * colors.length)] || 'blue'
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
            const newProject = {
                id: Date.now().toString(),
                name: capitalize(parsed.projectId),
                color: randomColor
            }
            projectStore.addProject(newProject)
            projectId = newProject.id
         }
    }

    taskStore.addTask({
        id: Date.now().toString(),
        title: parsed.title || 'Untitled',
        completed: false,
        projectId,
        priority: parsed.priority,
        createdAt: Date.now()
    })
}

function close() {
    isOpen.value = false
}

function triggerAction(action: any) {
    action.handler()
    close()
}

/* Utils */
function getProjectColorClass(name: string) {
    const p = projectStore.projects.find(x => x.name.toLowerCase() === name?.toLowerCase())
    if (!p) return 'bg-zinc-500'
    const map: Record<string, string> = { blue: 'bg-blue-500', green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500' }
    return map[p.color] || 'bg-zinc-500'
}

function getProjectName(name: string) {
    // Just return capitalized if exists or new
    const p = projectStore.projects.find(x => x.name.toLowerCase() === name?.toLowerCase())
    return p ? p.name : name
}

function getPriorityClass(p: string) {
    const map: Record<string, string> = {
        high: 'text-red-400 border-red-900/50 bg-red-900/10',
        medium: 'text-yellow-400 border-yellow-900/50 bg-yellow-900/10',
        low: 'text-blue-400 border-blue-900/50 bg-blue-900/10'
    }
    return map[p] || 'text-zinc-400'
}
</script>
