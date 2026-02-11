import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import UnpluginOxc from 'unplugin-oxc/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    UnpluginOxc()
  ] as any,
  test: {
    environment: 'jsdom',
    globals: true
  },
})
