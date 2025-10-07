/* eslint-env node */
module.exports = {
    root: true,
    env: { node: true, es2022: true },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier'
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ],
        '@typescript-eslint/consistent-type-imports': 'warn',
        'import/order': [
            'warn',
            {
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
                groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']]
            }
        ],
        'no-console': 'off'
    },
    ignorePatterns: ['dist', 'node_modules']
};
