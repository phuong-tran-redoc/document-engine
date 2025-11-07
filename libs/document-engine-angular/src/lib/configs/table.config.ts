import { EditorBubbleMenuConfig, ToolbarBubbleMenuConfig } from '../core';
import {
  TableCellStyleViewComponent,
  TableCreateViewComponent,
  TableMainViewComponent,
  TableStyleViewComponent,
} from '../views';

export const TableBubbleConfig: EditorBubbleMenuConfig = {
  props: {
    pluginKey: 'TableBubbleMenu',
    mountTo: 'table',
  },
  target: {
    kind: 'node',
    name: ['tableCell', 'tableHeader'],
    allowEmptySelection: true,
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
