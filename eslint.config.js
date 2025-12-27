// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            '.next/',
            '**/.next/**',
            'apps/web/.next/**',
            'apps/web/.turbo/**',
            'apps/web/node_modules/**',
            'apps/api/dist/**',
            'apps/api/generated/**',
            'apps/api/**/*.js',
        ],
    },
    ...tseslint.configs.recommended,
    {
        rules: {
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
        },
    },
);
