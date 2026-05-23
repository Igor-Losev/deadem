import { defineConfig } from 'vite';

const configuration = defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        build: {
            lib: {
                entry: './index.js',
                name: 'deademCs2',
                fileName: () => 'deadem-cs2.min.js',
                formats: [ 'umd' ]
            },
            emptyOutDir: true,
            sourcemap: true
        },
        worker: {
            rollupOptions: {
                output: {
                    file: 'deadem-cs2-worker.min.js'
                }
            }
        }
    };
});

export default configuration;
