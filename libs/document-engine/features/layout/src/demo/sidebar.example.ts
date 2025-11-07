import { CdkPortalOutlet } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  createComponent,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  inject,
  Renderer2,
  signal,
  viewChild,
  type ComponentRef,
  type Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserverService, BreakpointState } from '@shared/features/breakpoint-observer';
import { Avatar, AvatarClick } from '@shared/ui/avatar';
import { Sidebar, SIDEBAR_CONFIG, SidebarExpandVariant, SidebarModule, SidebarState } from '@shared/ui/sidebar';
import { DocumentEngineHeaderDirective } from '../header';
import { DocumentEngineSecondarySidebarComponent } from './secondary-sidebar';
import { AVATAR, DEEP_MENU, ITEMS, NORMAL_ITEMS, PROJECTS } from './sidebar.demo';
import { SidebarItem } from '../sidebar/sidebar.interface';
import { DocumentEngineSidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'document-engine-sidebar-example',
  templateUrl: 'sidebar.example.html',
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
})
export class DocumentEngineSidebarExampleComponent {
  /* Private */
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarService = inject(DocumentEngineSidebarService);
  private readonly breakpointService = inject(BreakpointObserverService);

  private readonly config = inject(SIDEBAR_CONFIG);
  private readonly renderer = inject(Renderer2);
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  private asideOverlayEl?: HTMLDivElement;
  private asidePanelEl?: HTMLDivElement;
  private removeOverlayClickListener?: () => void;
  private secondaryComponentRef?: ComponentRef<DocumentEngineSecondarySidebarComponent>;

  /* Views */
  private readonly primarySidebar = viewChild<Sidebar, ElementRef<HTMLElement>>('primarySidebarEl', {
    read: ElementRef<HTMLElement>,
  });
  readonly header = contentChild<DocumentEngineHeaderDirective>(DocumentEngineHeaderDirective);

  /* Public Constants */
  readonly items = ITEMS;
  readonly avatar = AVATAR;
  readonly projects = PROJECTS;
  readonly deepMenu = DEEP_MENU;
  readonly normalItems = NORMAL_ITEMS;

  /* Public Computed Signals */
  readonly sidebarState: Signal<SidebarState> = this.sidebarService.state;
  readonly breakpointChanges: Signal<BreakpointState | undefined> = toSignal<BreakpointState>(
    this.breakpointService.observe(),
  );
  readonly mode: Signal<'over' | 'side'> = computed(
    () => (this.breakpointChanges()?.name === 'mobile' ? 'over' : 'side') as 'over' | 'side',
  );
  readonly expandVariant: Signal<SidebarExpandVariant> = this.sidebarService.expandVariant;

  /* Public Methods */
  onAvatarClick(event: AvatarClick): void {
    console.log(event);
  }

  isActive(item: SidebarItem): boolean {
    return item.url === '/alpha';
  }

  onItemClick(item: unknown): void {
    console.log(item);
  }

  onSidebarStateChange(state: SidebarState): void {
    this.sidebarService.setState(state);
  }

  /* Secondary overlay sidebar for compact mode deep menu */
  secondaryState = signal<SidebarState>('close');
  secondaryTitle = signal<string>('');
  secondaryNodes = signal<SidebarItem[]>([]);

  openSecondary(node: SidebarItem): void {
    if (!node.items?.length) return;

    this.secondaryTitle.set(node.name);
    this.secondaryNodes.set(node.items ?? []);

    this.openSecondaryOverlay();
  }

  closeSecondary(): void {
    this.secondaryTitle.set('');
    this.secondaryNodes.set([]);
    this.hideSecondaryPanel();
    this.hideAsideOverlay();

    if (this.secondaryComponentRef) {
      this.appRef.detachView(this.secondaryComponentRef.hostView);
      this.secondaryComponentRef.destroy();
      this.secondaryComponentRef = undefined;
    }
  }

  private async openSecondaryOverlay(): Promise<void> {
    const anchor = this.primarySidebar();
    if (!anchor) throw new Error('Primary sidebar not found');

    // Show backdrop overlay
    this.showAsideOverlay();

    // Create side panel container if not exists
    if (!this.asidePanelEl) {
      this.asidePanelEl = this.renderer.createElement('div');
      this.renderer.addClass(this.asidePanelEl, 'document-engine-secondary-sidebar-panel');

      // Inline essential styles to avoid relying on global CSS
      this.renderer.setStyle(this.asidePanelEl, 'left', `${this.config.width.overCompactPx}px`);
      this.renderer.setStyle(this.asidePanelEl, 'width', this.config.width.overFull);
      // Base panel class handles positioning and transitions
      this.renderer.addClass(this.asidePanelEl, 'document-engine-secondary-sidebar-panel');

      // Append beside the sidebar host
      const parent = this.hostRef.nativeElement.parentElement as HTMLElement | null;
      if (!parent) return;
      this.renderer.appendChild(parent, this.asidePanelEl);
    }

    // Create and mount component into the panel
    this.secondaryComponentRef?.destroy();
    this.secondaryComponentRef = createComponent(DocumentEngineSecondarySidebarComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: this.asidePanelEl as HTMLDivElement,
    });

    // Attach to Angular change detection so events and bindings work
    this.appRef.attachView(this.secondaryComponentRef.hostView);

    this.secondaryComponentRef.setInput('title', this.secondaryTitle());
    this.secondaryComponentRef.setInput('nodes', this.secondaryNodes());
    this.secondaryComponentRef.changeDetectorRef.detectChanges();
    this.secondaryComponentRef.instance.closed.subscribe(() => this.closeSecondary());

    // Trigger panel enter transition
    requestAnimationFrame(() => {
      if (this.asidePanelEl) {
        this.renderer.addClass(this.asidePanelEl, 'document-engine-secondary-sidebar-panel--visible');
      }
    });

    this.cdr.markForCheck();
  }

  private showAsideOverlay(): void {
    if (!this.asideOverlayEl) return;

    // Create overlay element
    const overlay = this.renderer.createElement('div') as HTMLDivElement;
    overlay.classList.add('document-engine-secondary-aside-overlay');
    this.asideOverlayEl = overlay;

    // Append next to the navigation host
    const parent = this.hostRef.nativeElement.parentElement as HTMLElement | null;
    if (!parent) return;
    this.renderer.appendChild(parent, overlay);

    // Do not cover the primary sidebar: start overlay after compact width
    overlay.style.left = `${this.config.width.overCompactPx}px`;

    // Trigger overlay enter transition
    requestAnimationFrame(() => {
      overlay.classList.add('document-engine-secondary-aside-overlay--visible');
    });

    // Click to close
    const handler = () => this.closeSecondary();
    overlay.addEventListener('click', handler);
    this.removeOverlayClickListener = () => overlay.removeEventListener('click', handler);
  }

  private hideAsideOverlay(): void {
    if (!this.asideOverlayEl) return;

    this.removeOverlayClickListener?.();
    this.removeOverlayClickListener = undefined;

    const el = this.asideOverlayEl as HTMLDivElement;
    const onEnd = () => {
      el.removeEventListener('transitionend', onEnd);
      const parent = this.hostRef.nativeElement.parentElement as HTMLElement | null;
      if (parent) this.renderer.removeChild(parent, el);
      this.asideOverlayEl = undefined;
    };
    el.addEventListener('transitionend', onEnd);
    el.classList.remove('document-engine-secondary-aside-overlay--visible');
  }

  private hideSecondaryPanel(): void {
    if (!this.asidePanelEl) return;

    const el = this.asidePanelEl as HTMLDivElement;
    const onEnd = () => {
      el.removeEventListener('transitionend', onEnd);
      const parent = this.hostRef.nativeElement.parentElement as HTMLElement | null;
      if (parent) this.renderer.removeChild(parent, el);
      this.asidePanelEl = undefined;
    };
    el.addEventListener('transitionend', onEnd);
    el.classList.remove('document-engine-secondary-sidebar-panel--visible');
  }
}
