<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-xl">
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <audio ref="audioRef" loop></audio>

      <div class="relative w-full max-w-2xl flex flex-col items-center gap-6 md:gap-12 text-center">
        <!-- Close Button -->
        <button @click="close" class="absolute -top-2 right-0 md:-top-16 text-zinc-500 hover:text-white transition-colors p-2">
            <X :size="32" />
        </button>

        <!-- Header -->
        <div class="space-y-4">
          <h2 class="text-zinc-500 uppercase tracking-[0.2em] text-sm font-bold">Focusing on</h2>
          <h1 class="text-2xl md:text-4xl lg:text-5xl font-black text-white glow-text leading-tight">
            {{ task?.title }}
          </h1>
        </div>

        <!-- Timer -->
        <div class="relative group">
          <div class="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>
          <div class="relative w-44 h-44 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full border-4 border-zinc-800 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
            <span class="text-4xl md:text-6xl lg:text-7xl font-mono font-bold text-emerald-500 tabular-nums">
              {{ formattedTime }}
            </span>
            <span class="text-zinc-500 uppercase tracking-widest text-xs mt-2 font-bold">{{ isPaused ? 'Paused' : 'Active' }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          <button 
            @click="togglePause"
            class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-zinc-700 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-zinc-900/50"
          >
            <Play v-if="isPaused" :size="28" />
            <Pause v-else :size="28" />
          </button>

          <button 
            @click="completeTask"
            class="px-5 py-3 md:px-8 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold flex items-center gap-2 md:gap-3 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20 text-sm md:text-base"
          >
            <CheckCircle :size="20" />
            <span class="hidden md:inline">Mission Accomplished</span>
            <span class="md:hidden">Done!</span>
          </button>

          <button 
            @click="startFiveMinRule"
            class="px-3 py-1.5 md:px-4 md:py-2 border border-orange-500/50 text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/10 transition-all flex items-center gap-2"
          >
            <Zap :size="12" /> 5-Min Rule
          </button>

          <button 
            @click="handleBreakdown"
            class="px-3 py-1.5 md:px-4 md:py-2 border border-emerald-500/50 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all flex items-center gap-2"
          >
            <Sparkles :size="12" /> AI Breakdown
          </button>

          <button 
            @click="cycleAudio"
            class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-zinc-700 hover:border-blue-500/50 hover:text-blue-400 transition-all bg-zinc-900/50 relative group"
            :class="{ 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]': currentAudioMode !== 'none' }"
          >
            <component :is="currentAudioIcon" :size="24" />
            <span class="absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {{ currentAudioMode }}
            </span>
          </button>

          <button 
            @click="resetTimer"
            class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-zinc-700 hover:border-red-500/50 hover:text-red-400 transition-all bg-zinc-900/50"
          >
            <RotateCcw :size="24" />
          </button>
        </div>

        <!-- Tip -->
        <p class="text-zinc-500 italic max-w-sm">
          "The secret of getting ahead is getting started." — Mark Twain
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { X, Play, Pause, RotateCcw, CheckCircle, Zap, Cloud, Sparkles, Coffee, Waves } from 'lucide-vue-next'
import type { Task } from '../stores/task'
import { useTaskStore } from '../stores/task'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits(['close'])

const taskStore = useTaskStore()
const timeLeft = ref(25 * 60)
const isPaused = ref(true)
const audioRef = ref<HTMLAudioElement | null>(null)
const audioModeIndex = ref(0)
const audioModes = [
    { name: 'none', icon: Cloud, url: '' },
    { name: 'Rain', icon: Cloud, url: '/sounds/rain.mp3' },
    { name: 'Café', icon: Coffee, url: '/sounds/coffee.mp3' },
    { name: 'Deep', icon: Waves, url: '/sounds/waves.mp3' }
]
let timerInterval: any = null

const currentAudioMode = computed(() => audioModes[audioModeIndex.value]?.name || 'none')
const currentAudioIcon = computed(() => audioModes[audioModeIndex.value]?.icon || Cloud)

function cycleAudio() {
    audioModeIndex.value = (audioModeIndex.value + 1) % audioModes.length
    const mode = audioModes[audioModeIndex.value]
    
    if (!audioRef.value || !mode) return
    
    if (mode.name === 'none') {
        audioRef.value.pause()
    } else {
        audioRef.value.src = mode.url
        audioRef.value.play().catch((e) => {
            console.error('Audio playback failed:', e)
            alert('Audio playback blocked by browser settings. Please interact with the page or check your permissions.')
        })
    }
}

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60)
  const secs = timeLeft.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

function startTimer() {
  if (timerInterval) return
  isPaused.value = false
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
      // Optional: Sound notification
    }
  }, 1000)
}

function stopTimer() {
  isPaused.value = true
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function togglePause() {
  if (isPaused.value) startTimer()
  else stopTimer()
}

function resetTimer() {
  stopTimer()
  timeLeft.value = 25 * 60
}

function startFiveMinRule() {
    stopTimer()
    timeLeft.value = 5 * 60
    startTimer()
}

function close() {
  stopTimer()
  emit('close')
}

function completeTask() {
    if (props.task) {
        taskStore.toggleTask(props.task.id)
        close()
    }
}

async function handleBreakdown() {
    if (props.task) {
        await taskStore.breakdownTask(props.task.id)
        close()
    }
}

watch(() => props.isOpen, (val) => {
    if (val) {
        timeLeft.value = 25 * 60
        isPaused.value = true
    }
})

onUnmounted(() => stopTimer())
</script>

<style scoped>
.glow-text {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
