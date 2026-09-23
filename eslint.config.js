const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', 'coverage/**', '.expo/**', 'android/**', 'ios/**'] },
  { files: ['tests/**/*.ts', 'tests/**/*.tsx'], languageOptions: { globals: {
    describe: 'readonly', test: 'readonly', expect: 'readonly', jest: 'readonly',
  } } },
]);
