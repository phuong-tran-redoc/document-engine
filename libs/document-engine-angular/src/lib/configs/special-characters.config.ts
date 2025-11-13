import { ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { SpecialCharactersViewComponent } from '../views/special-characters-view/special-characters-view';

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
