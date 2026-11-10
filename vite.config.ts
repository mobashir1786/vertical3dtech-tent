import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-drei',
              test: /[\\/]node_modules[\\/]@react-three[\\/]drei[\\/]/,
              includeDependenciesRecursively: false,
              priority: 20,
            },
            {
              name: 'three-core',
              test: /[\\/]node_modules[\\/]three[\\/]/,
              includeDependenciesRecursively: false,
              priority: 20,
            },
            {
              name: 'react-three-fiber',
              test: /[\\/]node_modules[\\/]@react-three[\\/]fiber[\\/]/,
              includeDependenciesRecursively: false,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})
