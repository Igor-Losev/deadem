import { defineConfig } from 'vite';

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

