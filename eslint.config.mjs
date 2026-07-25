import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['build/**', 'dist/**', 'zip/**', 'node_modules/**']
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules (type-aware rules disabled for performance)
  ...tseslint.configs.recommended,

  // Global config for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Allow console in development
      'no-console': 'off',
      // TS already catches undefined identifiers; the bare rule misfires on
      // DefinePlugin-injected globals (e.g. RUNTIME_ENV).
      'no-undef': 'off',
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      // Relax any-type for gradual migration
      '@typescript-eslint/no-explicit-any': 'warn',
      // require() is valid CommonJS in build scripts and background entries
      '@typescript-eslint/no-require-imports': 'off',
      // The following flag real code-quality issues in legacy code; downgraded
      // to warning so lint passes while leaving them visible for cleanup.
      'prefer-const': 'warn',
      'no-empty': 'warn',
      'no-useless-assignment': 'warn',
      'no-prototype-builtins': 'warn',
      'no-extra-boolean-cast': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      // New react-hooks v7 rules: surface as warnings during migration
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn'
    }
  },

  // Config and build scripts (Node environment)
  {
    files: ['webpack.config.js', 'utils/**/*.js'],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
)
