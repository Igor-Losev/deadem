import { defineConfig } from 'vite';

const configuration = defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        build: {
            lib: {
                entry: './index.js',
                name: 'deademDota2',
                fileName: () => 'deadem-dota2.min.js',
                formats: [ 'umd' ]
            },
            emptyOutDir: true,
            sourcemap: true
        },
        worker: {
            rollupOptions: {
                output: {
                    file: 'deadem-dota2-worker.min.js'
                }
            }
        }
    };
});

export default configuration;
