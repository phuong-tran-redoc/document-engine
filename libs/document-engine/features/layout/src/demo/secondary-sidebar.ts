import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SidebarModule } from '@shared/ui/sidebar';
import { SidebarItem } from '../sidebar';

@Component({
  selector: 'document-engine-secondary-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatExpansionModule,
    SidebarModule,
    MatButtonToggleModule,
  ],
  styles: [
    `
      :host {
        --mat-expansion-header-text-weight: 400;
        --mat-expansion-header-hover-state-layer-color: transparent;
        --mat-expansion-container-text-color: var(--sidebar-foreground);
        --mat-expansion-container-background-color: transparent;
      }
    `,
  ],
  template: `
    <div
      class="flex h-full flex-col"
      documentEngineSidebarContext
      [sidebarMode]="'over'"
      [sidebarState]="'open'"
      [sidebarExpandVariant]="'full'"
    >
      <div class="flex items-center px-3 py-2 border-b border-[var(--sidebar-border)]">
        <div class="font-semibold">{{ title() }}</div>

        <button class="ml-auto documentEngine-button--icon" mat-icon-button (click)="closed.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="p-2">
        <ul documentEngineSidebarMenu>
          <ng-container
            [ngTemplateOutlet]="renderNodes"
            [ngTemplateOutletContext]="{ $implicit: nodes(), depth: 0 }"
          ></ng-container>
        </ul>
      </div>
    </div>

    <ng-template #renderNodes let-nodes let-depth="depth">
      @for (node of nodes; track node.id) { @if (!!node.items?.length) {
      <mat-expansion-panel hideToggle #exp="matExpansionPanel" class="group/collapsible !shadow-none">
        <mat-expansion-panel-header class="!p-0 !h-auto">
          @if (depth === 0) {
          <li documentEngineSidebarMenuItem class="w-full">
            <button documentEngineSidebarMenuButton class="w-full text-left">
              @if (node.icon) {
              <mat-icon class="documentEngine-icon--base min-w-5">{{ node.icon }}</mat-icon>
              }
              <span>{{ node.name }}</span>
              <mat-icon
                class="transition-transform duration-200 ease-in-out documentEngine-icon--base ml-auto"
                [class.rotate-90]="exp.expanded"
              >
                chevron_right
              </mat-icon>
            </button>
          </li>
          } @else {
          <li documentEngineSidebarMenuSubItem class="w-full">
            <a documentEngineSidebarMenuSubButton class="w-full">
              <span>{{ node.name }}</span>
              <mat-icon
                class="transition-transform duration-200 ease-in-out documentEngine-icon--base ml-auto"
                [class.rotate-90]="exp.expanded"
              >
                chevron_right
              </mat-icon>
            </a>
          </li>
          }
        </mat-expansion-panel-header>

        <ul documentEngineSidebarMenuSub>
          <ng-container
            [ngTemplateOutlet]="renderNodes"
            [ngTemplateOutletContext]="{ $implicit: node.items, depth: depth + 1 }"
          ></ng-container>
        </ul>
      </mat-expansion-panel>
      } @else { @if (depth === 0) {
      <li documentEngineSidebarMenuItem>
        <a documentEngineSidebarMenuButton [routerLink]="node.url" [isActive]="node.isActive ?? false">
          <span>{{ node.name }}</span>
        </a>
      </li>
      } @else {
      <li documentEngineSidebarMenuSubItem>
        <a documentEngineSidebarMenuSubButton [routerLink]="node.url" [isActive]="node.isActive ?? false">
          <span>{{ node.name }}</span>
        </a>
      </li>
      } } }
    </ng-template>
  `,
})
export class DocumentEngineSecondarySidebarComponent {
  title = input.required<string>();
  nodes = input.required<SidebarItem[]>();
  closed = output<void>();
}
