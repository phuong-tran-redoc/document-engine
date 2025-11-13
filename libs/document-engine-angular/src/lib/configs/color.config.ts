import { ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { ColorPickerViewComponent } from '../views/color-picker-view/color-picker-view';

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
