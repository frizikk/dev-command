<template>
  <div class="p-4 bg-zinc-900/50 border-y border-zinc-800/50 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold">
          {{ userStore.level }}
        </div>
        <div>
          <div class="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Level</div>
          <div class="text-xs text-zinc-300 font-bold uppercase tracking-tight">System Operative</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Streak</div>
        <div class="text-xs text-orange-500 font-bold flex items-center gap-1 justify-end">
          <Flame :size="12" /> {{ userStore.streak }} Days
        </div>
      </div>
    </div>

    <!-- XP Bar -->
    <div class="space-y-1">
      <div class="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
        <span>XP: {{ userStore.xp }}</span>
        <span>{{ userStore.xpToNextLevel(userStore.level) }}</span>
      </div>
      <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
          :style="{ width: `${(userStore.xp / userStore.xpToNextLevel(userStore.level)) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { Flame } from 'lucide-vue-next'

const userStore = useUserStore()
</script>
