// eslint.config.js
import tseslint from '@typescript-eslint/eslint-plugin';
export default [
    {
        ignores: ["node_modules/", "dist/", "build/"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            }
        },
        rules: {
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
        }
    },
    ...tseslint.configs.recommended,
];
