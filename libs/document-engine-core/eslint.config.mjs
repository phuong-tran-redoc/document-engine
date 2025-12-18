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
          ignoredDependencies: [
            'tslib',
            '@tiptap/extension-blockquote',
            '@tiptap/extension-bold',
            '@tiptap/extension-bubble-menu',
            '@tiptap/extension-code',
            '@tiptap/extension-code-block',
            '@tiptap/extension-document',
            '@tiptap/extension-floating-menu',
            '@tiptap/extension-hard-break',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extension-image',
            '@tiptap/extension-italic',
            '@tiptap/extension-link',
            '@tiptap/extension-strike',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-text',
            '@tiptap/extension-text-align',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
            '@tiptap/extensions',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
