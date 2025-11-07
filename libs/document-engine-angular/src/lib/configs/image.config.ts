import { ToolbarBubbleMenuConfig } from '../core';
import { ImageInsertViewComponent } from '../views';

export const ImageBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'ImageBubbleMenu',
  views: [
    {
      id: 'insert',
      component: ImageInsertViewComponent,
      label: 'Insert Image',
      isDefault: true,
    },
  ],
};

