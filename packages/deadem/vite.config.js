import { defineConfig } from 'vite';

const configuration = defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        build: {
            lib: {
                entry: './index.js',
                name: 'deadem',
                fileName: () => 'deadem.min.js',
                formats: [ 'umd' ]
            },
            emptyOutDir: true,
            sourcemap: true
        },
        worker: {
            rollupOptions: {
                output: {
                    file: 'deadem-worker.min.js'
                }
            }
        }
    };
});

export default configuration;
