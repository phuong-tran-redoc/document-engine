import { Component, computed, inject, input, computed as ngComputed, output } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SIDEBAR_CONTEXT, SidebarContext } from '../configs/sidebar-context.token';
import { SIDEBAR_CONFIG } from '../configs/sidebar.token';
import { SidebarExpandVariant, SidebarMode, SidebarState } from '../types';

@Component({
  selector: 'document-engine-sidebar',
  templateUrl: './sidebar.html',
  imports: [MatSidenavModule],
  providers: [
    {
      provide: SIDEBAR_CONTEXT,
      deps: [Sidebar],
      useFactory: (cmp: Sidebar): SidebarContext => ({
        isCompact: ngComputed(() => cmp.expandVariant() === 'compact'),
        isOpen: ngComputed(() => cmp.state() === 'open'),
        isOver: ngComputed(() => cmp.mode() === 'over'),
      }),
    },
  ],
})
export class Sidebar {
  public mode = input<SidebarMode>('side');
  public state = input<SidebarState>('open');
  public hasBackdrop = input<boolean>(false);
  public backdropClass = input<string>('cdk-overlay-transparent-backdrop');
  public expandVariant = input<SidebarExpandVariant>('full');

  public closeStart = output<void>();

  private readonly config = inject(SIDEBAR_CONFIG);

  private readonly widthStrategy = {
    side: {
      full: { open: 'sideFull', close: '0px' },
      compact: { open: 'sideCompact', close: '0px' },
    },
    over: {
      full: { open: 'overFull', close: '0px' },
      compact: { open: 'overCompact', close: '0px' },
    },
  } as const;

  public width = computed(() => {
    const mode = this.mode();
    const state = this.state();
    const expandVariant = this.expandVariant();

    const configKey = this.widthStrategy[mode][expandVariant][state];
    return configKey === '0px' ? '0px' : this.config.width[configKey];
  });

  public cssVariables = computed(() => {
    return {
      '--mat-sidenav-container-width': this.width(),
      '--mat-sidenav-container-background-color': 'var(--sidebar)',
      '--mat-sidenav-container-shape': '4px',
      '--mat-sidenav-container-divider-color': 'var(--sidebar-border)',
      '--mat-sidenav-container-text-color': 'var(--sidebar-foreground)',
      '--mat-sidenav-content-background-color': 'var(--background)',
    };
  });
}
