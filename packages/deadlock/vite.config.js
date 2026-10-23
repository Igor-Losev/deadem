import { defineConfig } from 'vite';

const configuration = defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        build: {
            lib: {
                entry: './index.js',
                name: 'deadem.deadlock',
                fileName: () => 'deadem-deadlock.min.js',
                formats: [ 'umd' ]
            },
            emptyOutDir: true
        }
    };
});

export default configuration;
