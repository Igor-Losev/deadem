import { defineConfig } from 'vite';

const configuration = defineConfig((_) => {
    return {
        define: {
            global: 'globalThis'
        },
        build: {
            lib: {
                entry: './index.js',
                name: 'deadem.cs2',
                fileName: () => 'deadem-cs2.min.js',
                formats: [ 'umd' ]
            },
            emptyOutDir: true
        }
    };
});

export default configuration;
