// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['node_modules/', 'dist/', 'build/'],
    },
    ...tseslint.configs.recommended,
    {
        rules: {
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
        },
    },
);
