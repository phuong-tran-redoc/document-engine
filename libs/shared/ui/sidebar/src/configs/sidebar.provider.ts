import { SIDEBAR_DEFAULT_CONFIG } from '../constants';
import { SidebarConfig } from '../types';
import { SIDEBAR_CONFIG } from './sidebar.token';

export function provideSidebar(config?: Partial<SidebarConfig>) {
  return [
    {
      provide: SIDEBAR_CONFIG,
      useFactory: () => ({ ...SIDEBAR_DEFAULT_CONFIG, ...config }),
    },
  ];
}
