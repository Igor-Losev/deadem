import { defineConfig } from 'eslint/config';
import commonConfig from './../../eslint.common.config.js';

export default defineConfig([
    {
        extends: [ commonConfig ]
    }
]);

