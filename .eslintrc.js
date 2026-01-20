module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console in Node.js apps
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'warn',
    'eqeqeq': ['warn', 'always'],
    'curly': ['warn', 'all'],
    'brace-style': ['warn', '1tbs'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['warn', 'always'],
    'no-trailing-spaces': 'warn',
    'comma-dangle': ['warn', 'never'],
    'arrow-spacing': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
  },
  overrides: [
    {
      // Backend-specific configuration
      files: ['backend/**/*.js'],
      env: {
        node: true,
        es2021: true,
      },
      rules: {
        'no-process-exit': 'off',
      },
    },
    {
      // Client-specific configuration
      files: ['client/src/**/*.{js,jsx}'],
      env: {
        browser: true,
        es2021: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      plugins: ['react', 'react-hooks'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/react-in-jsx-scope': 'off', // Not needed in React 18+
        'react/prop-types': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
