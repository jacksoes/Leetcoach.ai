import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
   build: {
    rollupOptions: {
      input: {
        content: "src/content/content.tsx"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
})
