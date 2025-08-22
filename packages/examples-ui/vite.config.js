import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        optimizeDeps: {
            include: [
                'buffer'
            ]
        },
        plugins: [
            react()
        ],
        resolve: {
            alias: {
                'node:buffer': 'buffer'
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

