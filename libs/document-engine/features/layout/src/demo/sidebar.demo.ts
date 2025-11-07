import { AvatarItem } from '@shared/ui/avatar';
import { SidebarItem } from '../sidebar';

export const AVATAR: AvatarItem[] = [
  { id: '1', alt: 'Avatar', photo: 'https://avatars.githubusercontent.com/u/124599?v=4' },
];

export const NORMAL_ITEMS: SidebarItem[] = [
  { id: '1', name: 'Home', url: '/home', icon: 'dashboard', type: 'normal' },
  { id: '2', name: 'Analytics', url: '/analytics', icon: 'analytics', isActive: true, type: 'normal' },
  { id: '3', name: 'Settings', url: '/settings', icon: 'settings', type: 'normal' },
];

export const PROJECTS: SidebarItem[] = [
  { id: '1', name: 'Project Alpha', url: '/alpha', icon: 'folder', type: 'normal' },
  { id: '2', name: 'Project Beta', url: '/beta', icon: 'folder', type: 'normal' },
  { id: '3', name: 'Project Gamma', url: '/gamma', icon: 'folder', type: 'normal' },
];

export const ITEMS: SidebarItem[] = [
  {
    id: '1',
    name: 'Overview',
    icon: 'dashboard',
    isActive: true,
    type: 'collapsible',
    items: [
      { id: '1', name: 'Summary', url: '/overview/summary', isActive: true, type: 'normal' },
      { id: '2', name: 'Reports', url: '/overview/reports', isActive: false, type: 'normal' },
    ],
  },
  {
    id: '2',
    name: 'Management (Submenu) - Long long long title',
    icon: 'settings',
    isActive: false,
    type: 'collapsible',
    items: [
      { id: '1', name: 'Users', url: '/management/users', isActive: false, type: 'normal' },
      { id: '2', name: 'Teams', url: '/management/teams', isActive: false, type: 'normal' },
    ],
  },
];

// Deep nested configurable input
export const DEEP_MENU: SidebarItem[] = [
  {
    id: '1',
    name: 'Level 1',
    expanded: false,
    icon: 'dashboard',
    type: 'collapsible',
    items: [
      { id: '1', name: 'Level 2 - A', url: '/deep/2-a', type: 'normal' },
      {
        id: '2',
        name: 'Level 2 - B',
        type: 'collapsible',
        items: [
          { id: '1', name: 'Level 3 - 1', url: '/deep/3-1', type: 'normal' },
          { id: '2', name: 'Level 3 - 2', url: '/deep/3-2', type: 'normal' },
        ],
      },
    ],
  },
];
