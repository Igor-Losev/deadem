import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
    {
        files: [ '**/*.js' ],
        extends: [ 'js/recommended' ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.jest,
                ...globals.node
            }
        },
        plugins: {
            js,
            '@stylistic': stylistic
        },
        rules: {
            '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
            '@stylistic/block-spacing': [ 'error', 'always' ],
            '@stylistic/comma-dangle': [ 'error', 'never' ],
            '@stylistic/indent': [ 'error', 4 ],
            '@stylistic/key-spacing': [ 'error', { afterColon: true, beforeColon: false, mode: 'strict' } ],
            '@stylistic/keyword-spacing': [ 'error' ],
            '@stylistic/object-curly-spacing': [ 'error', 'always' ],
            '@stylistic/space-before-blocks': [ 'error', 'always' ],
            '@stylistic/space-in-parens': [ 'error', 'never' ],
            '@stylistic/template-curly-spacing': [ 'error', 'never' ],
            'no-unused-vars': [ 'error', { argsIgnorePattern: '^_', 'varsIgnorePattern': '^_' } ],
            semi: 'error',
            'prefer-const': 'error',
            quotes: [ 'error', 'single' ]
        }
    }
]);
