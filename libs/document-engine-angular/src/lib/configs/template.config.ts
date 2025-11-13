import { ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { TemplateViewComponent } from '../views/template-view/template-view';

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
