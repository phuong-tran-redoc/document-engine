import { NgModule } from '@angular/core';
import { SidebarContextDirective } from './directives/sidebar-context.directive';
import { SidebarMenuButtonDirective } from './directives/sidebar-menu-button.directive';
import { SidebarMenuDirective } from './directives/sidebar-menu.directive';
import { SidebarMenuItemDirective } from './directives/sidebar-menu-item.directive';
import { SidebarMenuSubButtonDirective } from './directives/sidebar-menu-sub-button.directive';
import { SidebarMenuSubDirective } from './directives/sidebar-menu-sub.directive';
import { SidebarMenuSubItemDirective } from './directives/sidebar-menu-sub-item.directive';
import { Sidebar } from './components';
import { SidebarContentDirective } from './directives/sidebar-content.directive';
import { SidebarGroupLabelDirective } from './directives/sidebar-group-label.directive';
import { SidebarGroupDirective } from './directives/sidebar-group.directive';
import { SidebarMenuActionDirective } from './directives/sidebar-menu-action.directive';
import { SidebarMenuBadgeDirective } from './directives/sidebar-menu-badge.directive';
import {
  SidebarMenuSkeletonDirective,
  SidebarMenuSkeletonIconDirective,
  SidebarMenuSkeletonTextDirective,
} from './directives/sidebar-menu-skeleton.directive';
import { SidebarSeparatorDirective } from './directives/sidebar-separator.directive';

@NgModule({
  imports: [
    Sidebar,
    SidebarContentDirective,
    SidebarContextDirective,
    SidebarGroupLabelDirective,
    SidebarGroupDirective,
    SidebarMenuActionDirective,
    SidebarMenuBadgeDirective,
    SidebarMenuSkeletonDirective,
    SidebarMenuSkeletonIconDirective,
    SidebarMenuSkeletonTextDirective,
    SidebarMenuDirective,
    SidebarMenuItemDirective,
    SidebarMenuButtonDirective,
    SidebarMenuSubDirective,
    SidebarMenuSubItemDirective,
    SidebarMenuSubButtonDirective,
    SidebarSeparatorDirective,
  ],
  exports: [
    Sidebar,
    SidebarContentDirective,
    SidebarContextDirective,
    SidebarGroupLabelDirective,
    SidebarMenuDirective,
    SidebarMenuItemDirective,
    SidebarMenuButtonDirective,
    SidebarMenuSubDirective,
    SidebarMenuSubItemDirective,
    SidebarMenuSubButtonDirective,
    SidebarSeparatorDirective,
    SidebarGroupDirective,
    SidebarMenuActionDirective,
    SidebarMenuBadgeDirective,
    SidebarMenuSkeletonDirective,
    SidebarMenuSkeletonIconDirective,
    SidebarMenuSkeletonTextDirective,
  ],
})
export class SidebarModule {}
