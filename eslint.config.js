import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  { ignores: ['dist/'] },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: pluginVue,
      parserOptions: {
        sourceType: 'module',
        parser: {
          ts: tseslint.parser
        }
      }
    }
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended
];
