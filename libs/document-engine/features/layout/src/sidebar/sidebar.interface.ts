export interface SidebarItem {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  isActive?: boolean;
  expanded?: boolean;
  items?: SidebarItem[];
  type: 'normal' | 'collapsible';
}
