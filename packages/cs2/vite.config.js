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
        }
    };
});

export default configuration;
