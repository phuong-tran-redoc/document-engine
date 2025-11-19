import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          ignoreDependencies: [
            '@tiptap/core',
            '@tiptap/extension-bubble-menu',
            '@tiptap/extension-floating-menu',
            '@tiptap/extension-blockquote',
            '@tiptap/extension-bold',
            '@tiptap/extension-code',
            '@tiptap/extension-code-block',
            '@tiptap/extension-document',
            '@tiptap/extension-hard-break',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extension-image',
            '@tiptap/extension-italic',
            '@tiptap/extension-link',
            '@tiptap/extension-list',
            '@tiptap/extension-paragraph',
            '@tiptap/extension-strike',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-text',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
            '@tiptap/extensions',
            '@tiptap/extension-heading',
            '@tiptap/extension-table',
            '@tiptap/pm',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
