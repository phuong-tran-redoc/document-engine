export default {
  displayName: 'document-engine-core',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/document-engine-core',
  transformIgnorePatterns: ['node_modules/(?!(@tiptap|lodash-es)/)'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/**/*.d.ts',
    // Exclude UI-heavy files that require integration tests
    '!src/views/block-handler.ts',
    '!src/utils/dom.util.ts',
    '!src/models/color.model.ts',
    '!src/extensions/table-style.extension.ts',
    '!src/extensions/table-resizing.extension.ts',
    '!src/extensions/restricted-editing.extension.ts',
    '!src/extensions/reset-on-enter.extension.ts',
    '!src/constants/table.constant.ts',
  ],
  coverageReporters: ['text'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
