import { ToolbarBubbleMenuConfig } from '../core';
import { DynamicFieldsViewComponent } from '../views';

export const DynamicFieldsBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'DynamicFieldsBubbleMenu',
  views: [
    {
      id: 'fields',
      component: DynamicFieldsViewComponent,
      label: 'Dynamic Fields',
      isDefault: true,
    },
  ],
};

