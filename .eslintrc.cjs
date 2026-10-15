module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // Off in the recommended preset. It is what catches icon-only buttons with no accessible name.
    'jsx-a11y/control-has-associated-label': [
      'error',
      { ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'td', 'th', 'video'], includeRoles: ['alert', 'dialog'] },
    ],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Test helpers export components and functions together; fast refresh does not apply to them.
      files: ['src/test/**', 'src/**/__tests__/**'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ],
}