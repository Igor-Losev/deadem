import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const configuration = defineConfig(({ command }) => {
    const common = getCommonConfiguration();

    const isBuild = command === 'build';

    if (isBuild) {
        return {
            ...common,
            build: {
                lib: {
                    entry: './index.js',
                    name: 'deadem',
                    fileName: () => 'deadem.min.js',
                    formats: [ 'umd' ]
                },
                emptyOutDir: true,
                sourcemap: true
            }
        };
    } else {
        return {
            ...common,
            root: 'examples/runtime-browser',
            server: {
                open: true
            }
        };
    }
});

function getCommonConfiguration() {
    return {
        optimizeDeps: {
            include: [
                'readable-stream'
            ]
        },
        plugins: [
            nodePolyfills({
                globals: {
                    Buffer: true,
                    global: true,
                    process: true
                },
                protocolImports: true
            }),
            {
                /**
                 * https://github.com/protobufjs/protobuf.js/issues/1754
                 *
                 * Protobufjs uses `eval` internally via dynamic `require` resolution.
                 * This "plugin" removes the use of `eval`, which is unnecessary in browser environments
                 * and may cause security concerns or CSP violations.
                 *
                 * Since dynamic `require` is only relevant in Node.js, omitting it has no effect in browsers.
                 */
                name: 'protobuf-patch',
                transform(code, id) {
                    if (id.endsWith('@protobufjs/inquire/index.js')) {
                        return {
                            code: code.replace('eval("quire".replace(/^/,"re"))', 'require'),
                            map: null
                        };
                    }
                }
            }
        ],
        resolve: {
            alias: {
                'node:stream': 'readable-stream',
                'process/': 'process'
            }
        }
    };
}

export default configuration;
