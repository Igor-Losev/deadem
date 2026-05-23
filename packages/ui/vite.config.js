import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
    const libraryLoader = command === 'serve' || mode === 'preview'
        ? 'src/loaders/libraryLoader.local.js'
        : 'src/loaders/libraryLoader.cdn.js';

    return {
        define: {
            global: 'globalThis'
        },
        plugins: [
            react()
        ],
        resolve: {
            alias: {
                '#libraryLoader': path.join(directory, libraryLoader)
            }
        },
        server: {
            open: true,
            proxy: {
                '/tv': {
                    target: 'https://dist1-ord1.steamcontent.com',
                    changeOrigin: true
                }
            }
        }
    };
});
