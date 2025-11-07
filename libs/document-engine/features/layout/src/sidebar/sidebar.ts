import { CdkPortalOutlet } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, DestroyRef, inject, type Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ROUTE } from '@document-engine/util';
import { BreakpointObserverService, BreakpointState } from '@shared/features/breakpoint-observer';
import { Avatar, AvatarClick } from '@shared/ui/avatar';
import { ConfirmationDialogService } from '@shared/ui/confirmation-dialog';
import { Sidebar, SidebarExpandVariant, SidebarModule, SidebarState } from '@shared/ui/sidebar';
import { ToastService } from '@shared/ui/toast';
import { filter, map } from 'rxjs';
import { DocumentEngineHeaderDirective } from '../header';
import { DocumentEngineReasonTextareaComponent } from './reason-textarea';
import { SidebarItem } from './sidebar.interface';
import { DocumentEngineSidebarService } from './sidebar.service';

@Component({
  selector: 'document-engine-layout-sidebar',
  templateUrl: './sidebar.html',
  imports: [
    Sidebar,
    RouterModule,
    NgTemplateOutlet,
    MatDividerModule,
    MatExpansionModule,
    RouterOutlet,
    CdkPortalOutlet,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    Avatar,
    MatButtonToggleModule,
    SidebarModule,
  ],
  styles: [
    `
      :host {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;

        --mat-expansion-header-text-weight: 400;
        --mat-expansion-header-hover-state-layer-color: transparent;
        --mat-expansion-container-text-color: var(--sidebar-foreground);
        --mat-expansion-container-background-color: transparent;
      }
    `,
  ],
})
export class DocumentEngineSidebarComponent {
  /* Private */
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationDialogService);
  private readonly sidebarService = inject(DocumentEngineSidebarService);
  private readonly breakpointService = inject(BreakpointObserverService);

  /* Views */
  readonly header = contentChild<DocumentEngineHeaderDirective>(DocumentEngineHeaderDirective);

  /* Public Constants */
  // TODO: Get from user service
  readonly route = ROUTE;
  readonly avatar = [{ id: '1', alt: 'Avatar', photo: 'https://avatars.githubusercontent.com/u/124599?v=4' }];
  readonly items: Signal<SidebarItem[]> = computed(() => this.withActiveStates(this.buildItems(), this.currentUrl()));

  /* Public Computed Signals */
  readonly sidebarState: Signal<SidebarState> = this.sidebarService.state;
  readonly breakpointChanges: Signal<BreakpointState | undefined> = toSignal<BreakpointState>(
    this.breakpointService.observe()
  );
  readonly mode: Signal<'over' | 'side'> = computed(
    () => (this.breakpointChanges()?.name === 'mobile' ? 'over' : 'side') as 'over' | 'side'
  );
  readonly expandVariant: Signal<SidebarExpandVariant> = this.sidebarService.expandVariant;

  /* Router state */
  readonly currentUrl: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      takeUntilDestroyed(this.destroyRef)
    ),
    { initialValue: this.router.url }
  );

  private buildItems(): SidebarItem[] {
    return [
      { id: 'home', name: 'Home', url: ROUTE.HOME, icon: 'dashboard', type: 'normal' },
      // { id: 'assets', name: 'Assets', url: ROUTE.ASSETS, icon: 'diamond', type: 'normal' },
      {
        id: 'editor',
        name: 'Editor',
        url: ROUTE.EDITOR,
        icon: 'edit_note',
        type: 'collapsible',
        items: [
          { id: 'editor-test', name: 'Test', url: `${ROUTE.EDITOR}/test-advanced`, type: 'normal' },
          { id: 'editor-basic', name: 'Basic', url: `${ROUTE.EDITOR}/basic`, type: 'normal' },
          {
            id: 'editor-restricted-editing',
            name: 'Restricted Editing',
            url: `${ROUTE.EDITOR}/restricted-editing`,
            type: 'normal',
          },
          { id: 'editor-readonly', name: 'Readonly', url: `${ROUTE.EDITOR}/readonly`, type: 'normal' },
          { id: 'editor-table', name: 'Table', url: `${ROUTE.EDITOR}/table`, type: 'normal' },
          { id: 'editor-full', name: 'Full Features', url: `${ROUTE.EDITOR}/full`, type: 'normal' },
        ],
      },
      {
        id: 'lo-template',
        name: 'LO Templates',
        url: ROUTE.EDITOR,
        icon: 'description',
        type: 'collapsible',
        items: [
          {
            id: 'editor-document-builder',
            name: 'Document Builder',
            url: `${ROUTE.EDITOR}/document-builder`,
            type: 'normal',
          },
          {
            id: 'bizgrow',
            name: 'Bizgrow',
            url: `${ROUTE.EDITOR}/bizgrow`,
            type: 'normal',
          },
          {
            id: 'bizprop',
            name: 'Bizprop',
            url: `${ROUTE.EDITOR}/bizprop`,
            type: 'normal',
          },
        ],
      },
      // { id: 'playground', name: 'Playground', url: ROUTE.PLAYGROUND, icon: 'code', type: 'normal' },
    ];
  }

  private withActiveStates(items: SidebarItem[], currentUrl: string): SidebarItem[] {
    const ensureLeadingSlash = (url: string) => (url.startsWith('/') ? url : '/' + url);
    const normalize = (url: string | undefined) => ensureLeadingSlash((url ?? '').replace(/\/+$/, ''));
    const cur = normalize(currentUrl);

    const isUrlActive = (target?: string): boolean => {
      const tgt = normalize(target);
      if (!tgt) return false;
      return cur === tgt || cur.startsWith(tgt + '/') || cur.startsWith(tgt + '?');
    };

    return items.map((item) => {
      const hasChildren = Array.isArray(item.items) && item.items.length > 0;
      if (!hasChildren) return { ...item, isActive: isUrlActive(item.url) };

      const selfActive = isUrlActive(item.url);
      const anyChildActive = (item.items ?? []).some((child) => isUrlActive(child.url));

      return { ...item, isActive: anyChildActive || selfActive };
    });
  }

  /* Public Methods */
  onAvatarClick(event: AvatarClick): void {
    console.log(event);
  }

  onSidebarStateChange(state: SidebarState): void {
    this.sidebarService.setState(state);
  }

  openProfile(): void {
    this.confirmation
      .openConfirm<string>({
        icon: 'person',
        title: 'Update profile note',
        description: 'Add a short note before opening profile (optional).',
        content: DocumentEngineReasonTextareaComponent,
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
      .subscribe((reason) => {
        if (reason === undefined) return;
        this.toast.show({ type: 'normal', message: `Note: ${reason || '—'}` });
      });
  }

  logout(): void {
    this.confirmation
      .openAlert({
        icon: 'logout',
        title: 'Sign out',
        description: 'Are you sure you want to sign out?',
        confirmLabel: 'Logout',
        cancelLabel: 'Cancel',
        dismissable: false,
      })
      .subscribe((ok: boolean) => {
        if (!ok) return;

        this.toast.show({ type: 'normal', message: 'Feature not implemented' });
      });
  }
}
