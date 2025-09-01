import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const htmlPlugin = () => {
    return {
        name: 'html-transform',
        transformIndexHtml(html) {
            return html.replace(
                '</head>',
                `<script src="//cdn.jsdelivr.net/npm/deadem@1.X.X/dist/deadem.min.js"></script></head>`
            )
        }
    };
};

const deademImportPlugin = () => {
    return {
        name: 'deadem-import-transform',
        transform(src, id) {
            return {
                code: src.replace(/import\s+{([^}]*)}\s+from\s+['"]deadem['"];/g, (_, imports) => {
                    return `const {${imports}} = window.deadem;`;
                })
            };
        }
    };
};

export default defineConfig(({ mode }) => {
    return {
        build: {
            rollupOptions: {
                external: mode === 'production' ? ['deadem'] : [],
                output: {
                    globals: {
                        deadem: 'deadem'
                    }
                }
            }
        },
        define: {
            global: 'globalThis'
        },
        optimizeDeps: {
            include: [
                'buffer'
            ]
        },
        plugins: [
            react(),
            ...mode === 'production' ? [deademImportPlugin(), htmlPlugin()] : []
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

