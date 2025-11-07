import { ToolbarBubbleMenuConfig } from '../core';
import { ColorPickerViewComponent } from '../views';

export const ColorBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'ColorBubbleMenu',
  views: [
    {
      id: 'picker',
      component: ColorPickerViewComponent,
      label: 'Color Picker',
      isDefault: true,
    },
  ],
};
