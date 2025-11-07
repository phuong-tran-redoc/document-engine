import { EditorBubbleMenuConfig } from '../core';
import { LinkEditViewComponent, LinkMainViewComponent, LinkPropertiesViewComponent } from '../views/link-views';

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
