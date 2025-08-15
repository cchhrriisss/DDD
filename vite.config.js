import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        creator: resolve(__dirname, 'creator.html'),
        market: resolve(__dirname, 'market.html'),
        printing: resolve(__dirname, 'printing.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        itemDetails: resolve(__dirname, 'item-details.html'),
        // Add any other HTML pages you create here
      },
    },
  },
})