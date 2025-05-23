const { defineConfig } = require('eslint/config'),
    globals = require('globals'),
    js = require('@eslint/js'),
    stylistic = require('@stylistic/eslint-plugin');

module.exports = defineConfig([
    {
        files: [ '**/*.js' ],
        extends: [ 'js/recommended' ],
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.jest,
                ...globals.node
            },
            sourceType: 'script'
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
            semi: 'error',
            'prefer-const': 'error',
            quotes: [ 'error', 'single' ]
        }
    }
]);
