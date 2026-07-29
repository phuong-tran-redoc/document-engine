export * from './lib/components';
export * from './lib/core';
export * from './lib/ui';
export * from './lib/types';
export * from './lib/utils';
export * from './lib/views';

// Public because ToolbarComponent.headingOptions is typed with it.
export type { HeadingOption } from './lib/constants/text-style.constant';

// Re-export types from core for consumer convenience
export type { Editor } from '@tiptap/core';
