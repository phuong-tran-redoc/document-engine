import { ToolbarBubbleMenuConfig } from '../core';
import { TemplateViewComponent } from '../views';

export const TemplateBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'TemplateBubbleMenu',
  maxWidth: '400px',
  width: '400px',
  views: [
    {
      id: 'templates',
      component: TemplateViewComponent,
      label: 'Templates',
      isDefault: true,
    },
  ],
};

