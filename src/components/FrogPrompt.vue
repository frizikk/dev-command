<template>
  <Transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-x-0 bottom-0 z-[60] p-3 md:p-6 flex justify-center pointer-events-none">
      <div class="bg-zinc-900 border-2 border-orange-500/50 rounded-xl shadow-[0_0_50px_rgba(249,115,22,0.2)] p-4 md:p-6 max-w-xl w-full pointer-events-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden group">
        <!-- Glow Effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
        
        <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl md:text-3xl shake-animation shrink-0">
          🐸
        </div>

        <div class="flex-1 space-y-1 text-center md:text-left">
          <h3 class="text-orange-500 font-black uppercase tracking-widest text-xs">Morning Protocol: Eat The Frog</h3>
          <p class="text-zinc-200 font-bold text-lg leading-tight">
            Which task is the most difficult and important today?
          </p>
          <div class="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
            <template v-if="candidateTasks.length">
                <button 
                  v-for="task in candidateTasks.slice(0, 2)" 
                  :key="task.id"
                  @click="selectFrog(task.id)"
                  class="text-[10px] bg-zinc-800 hover:bg-orange-500 hover:text-black transition-all px-3 py-1.5 rounded font-black uppercase tracking-tighter truncate max-w-[150px]"
                >
                  {{ task.title }}
                </button>
            </template>
            <p v-else class="text-zinc-500 text-xs italic">No pending tasks to choose from...</p>
          </div>
        </div>

        <button @click="close" class="text-zinc-600 hover:text-white transition-colors">
          <X :size="20" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useTaskStore } from '../stores/task'
import { useUserStore } from '../stores/user'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const taskStore = useTaskStore()
const userStore = useUserStore()

const candidateTasks = computed(() => {
    // Pick uncompleted tasks, prioritize high weight if any
    return taskStore.tasks
        .filter(t => !t.completed)
        .sort((a, b) => {
            const weights = { high: 0, medium: 1, low: 2, undefined: 3 }
            return (weights[a.priority as keyof typeof weights] ?? 3) - (weights[b.priority as keyof typeof weights] ?? 3)
        })
})

function selectFrog(id: string) {
    userStore.setFrog(id)
    close()
}

function close() {
    emit('close')
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.shake-animation {
  animation: shake 2s infinite ease-in-out;
}
</style>
