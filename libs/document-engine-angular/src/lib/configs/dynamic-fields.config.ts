import { ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { DynamicFieldsViewComponent } from '../views/dynamic-fields-view/dynamic-fields-view';

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
