import { ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { ImageInsertViewComponent } from '../views/image-insert-view/image-insert-view';

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
