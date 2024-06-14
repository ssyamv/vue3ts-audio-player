import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    open: true,
    port: 5200
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/export.ts'),
      name: 'Vue3AudioPlayer',
      fileName: (format) => `vue3-audio-player.${format}.ts`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        inlineDynamicImports: true,
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
