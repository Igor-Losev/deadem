import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';

import globals from 'globals';

import commonConfig from './../../eslint.common.config.js';

export default defineConfig([
    {
        files: [ 'src/**/*.js' ],
        extends: [ commonConfig ]
    },
    {
        files: [ 'src/**/*.{js,jsx}' ],
        ...react.configs.flat.recommended,
        languageOptions: {
            ...react.configs.flat.languageOptions,
            globals: {
                ...globals.browser
            }
        },
        rules: {
            'react/prop-types': 'off'
        },
        settings: {
            ...react.configs.flat.settings,
            react: {
                version: 'detect'
            }
        }
    },
    {
        files: [ 'src/**/*.{js,jsx}' ],
        ...react.configs.flat['jsx-runtime']
    },
    {
        files: [ 'src/**/*.{js,jsx}' ],
        plugins: { '@stylistic': stylistic },
        rules: {
            '@stylistic/indent': [ 'error', 2 ]
        }
    }
]);

