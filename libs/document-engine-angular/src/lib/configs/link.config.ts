import { EditorBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { LinkEditViewComponent } from '../views/link-views/link-edit-view';
import { LinkMainViewComponent } from '../views/link-views/link-main-view';
import { LinkPropertiesViewComponent } from '../views/link-views/link-properties-view';

export const LinkBubbleConfig: EditorBubbleMenuConfig = {
  props: {
    pluginKey: 'LinkBubbleMenu',
  },
  target: { kind: 'mark', name: 'link', allowEmptySelection: true, requireFocus: true },
  views: [
    {
      id: 'main',
      component: LinkMainViewComponent,
      showWhen: (attrs) => !!attrs['href'], // Show when link exists
      label: 'Main View',
    },
    {
      id: 'edit',
      component: LinkEditViewComponent,
      showWhen: (attrs) => !attrs['href'], // Show when creating new link
      showOnForceOpen: true, // Show when toolbar button clicked
      label: 'Edit View',
    },
    {
      id: 'properties',
      component: LinkPropertiesViewComponent,
      label: 'Properties View',
    },
  ],
};
