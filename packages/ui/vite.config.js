import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        define: {
            global: 'globalThis'
        },
        plugins: [
            react()
        ],
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
