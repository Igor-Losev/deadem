import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
    {
        ignores: [ 'dist/**' ]
    },
    {
        files: [ '**/*.js' ],
        extends: [ 'js/recommended' ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            js,
            '@stylistic': stylistic
        },
        rules: {
            '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/block-spacing': [ 'error', 'always' ],
            '@stylistic/comma-dangle': [ 'error', 'never' ],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/eol-last': [ 'error', 'always' ],
            '@stylistic/indent': [ 'error', 4 ],
            '@stylistic/key-spacing': [ 'error', { afterColon: true, beforeColon: false, mode: 'strict' } ],
            '@stylistic/keyword-spacing': [ 'error' ],
            '@stylistic/lines-between-class-members': [ 'error', 'always', { exceptAfterSingleLine: true } ],
            '@stylistic/no-multiple-empty-lines': [ 'error', { max: 1 } ],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/object-curly-spacing': [ 'error', 'always' ],
            '@stylistic/quote-props': [ 'error', 'as-needed' ],
            '@stylistic/quotes': [ 'error', 'single' ],
            '@stylistic/semi': 'error',
            '@stylistic/space-before-blocks': [ 'error', 'always' ],
            '@stylistic/space-in-parens': [ 'error', 'never' ],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/template-curly-spacing': [ 'error', 'never' ],
            eqeqeq: [ 'error', 'always', { null: 'ignore' } ],
            'no-promise-executor-return': 'error',
            'no-self-compare': 'error',
            'no-shadow': 'error',
            'no-unreachable-loop': 'error',
            'no-unused-expressions': 'error',
            'no-unused-vars': [ 'error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' } ],
            'no-var': 'error',
            'prefer-const': 'error',
            'require-atomic-updates': 'error'
        }
    }
]);
