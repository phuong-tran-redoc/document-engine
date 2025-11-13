import { EditorBubbleMenuConfig, ToolbarBubbleMenuConfig } from '../core/bubble-menu/bubble-menu.type';
import { TableCellStyleViewComponent } from '../views/table-views/table-cell-style-view';
import { TableCreateViewComponent } from '../views/table-views/table-create-view';
import { TableMainViewComponent } from '../views/table-views/table-main-view';
import { TableStyleViewComponent } from '../views/table-views/table-style-view';

export const TableBubbleConfig: EditorBubbleMenuConfig = {
  props: {
    pluginKey: 'TableBubbleMenu',
    mountTo: 'table',
  },
  target: {
    kind: 'node',
    name: ['tableCell', 'tableHeader'],
    allowEmptySelection: true,
    requireFocus: false,
  },
  views: [
    {
      id: 'main',
      component: TableMainViewComponent,
      label: 'Table',
      isDefault: true,
    },
    {
      id: 'table-style',
      component: TableStyleViewComponent,
      label: 'Table Properties',
    },
    {
      id: 'cell-style',
      component: TableCellStyleViewComponent,
      label: 'Cell Properties',
    },
  ],
};

export const TableCreateBubbleConfig: ToolbarBubbleMenuConfig = {
  pluginKey: 'TableCreateBubbleMenu',
  views: [
    {
      id: 'create',
      component: TableCreateViewComponent,
      label: 'Create Table',
      isDefault: true,
    },
  ],
};
