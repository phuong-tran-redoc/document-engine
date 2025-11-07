import { ToolbarBubbleMenuConfig } from '../core';
import { SpecialCharactersViewComponent } from '../views';

export const SpecialCharactersBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'SpecialCharactersBubbleMenu',
  views: [
    {
      id: 'characters',
      component: SpecialCharactersViewComponent,
      label: 'Special Characters',
      isDefault: true,
    },
  ],
};

