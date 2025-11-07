import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EnvironmentInjector,
  inject,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import {
  BubbleMenuViewConfig,
  BubbleMenuViewContent,
  EventManager,
  FocusTrapService,
  ToolbarBubbleMenuConfig,
} from '../../core';

/**
 * A bubble menu wrapper specifically for toolbar buttons
 * Unlike the regular bubble menu, this one is positioned relative to toolbar buttons
 * and doesn't depend on text selection in the editor
 */
@Component({
  selector: 'notum-toolbar-bubble-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #bubbleElement
      class="toolbar-bubble-menu rounded border bg-card text-card-foreground border-border shadow-elevation-2 absolute z-50"
      [class.hidden]="!isVisible"
      [style.width]="config.width || 'auto'"
      [style.maxWidth]="config.maxWidth || '320px'"
    >
      <!-- View component will be dynamically inserted here -->
      <ng-container #viewContainer></ng-container>
    </div>
  `,
  styles: [
    `
      .toolbar-bubble-menu {
        opacity: 0;
        transform: translateY(-10px);
        transition:
          opacity 200ms ease-out,
          transform 200ms ease-out;
        pointer-events: none;
      }

      .toolbar-bubble-menu:not(.hidden) {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarBubbleMenuComponent implements AfterViewInit, OnDestroy {
  @Input() editor!: Editor;
  @Input() config!: ToolbarBubbleMenuConfig;

  private cdr = inject(ChangeDetectorRef);
  private eventManager = inject(EventManager);
  private focusTrap = inject(FocusTrapService);

  @ViewChild('bubbleElement') private bubbleElement!: ElementRef<HTMLElement>;
  @ViewChild('viewContainer', { read: ViewContainerRef }) private viewContainer!: ViewContainerRef;

  private currentViewRef: ComponentRef<BubbleMenuViewContent> | null = null;
  private currentViewId: string | null = null;
  private currentAttributes: Record<string, unknown> = {};

  isVisible = false;

  ngAfterViewInit(): void {
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      this.focusTrap.attach(bubbleElement, true);
    }
  }

  ngOnDestroy(): void {
    this.destroyCurrentView();
    this.hideBubble();
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      this.focusTrap.detach(bubbleElement);
    }
  }

  isActive(type: 'text' | 'fill'): boolean {
    return this.isVisible && this.currentAttributes['type'] === type;
  }

  toggleBubble(targetElement: HTMLElement, attrs: Record<string, unknown> = {}, viewId?: string): void {
    if (this.isVisible) {
      this.hideBubble();
      return;
    }

    this.showBubble(targetElement, attrs, viewId);
  }

  /**
   * Show the bubble menu positioned relative to a target element (toolbar button)
   */
  showBubble(targetElement: HTMLElement, attrs: Record<string, unknown> = {}, viewId?: string): void {
    this.currentAttributes = attrs;

    this.isVisible = true;

    // Create and show the view
    const initialView = this.selectInitialView(attrs, viewId);
    if (!initialView) {
      console.warn('[ToolbarBubbleMenu] No suitable view to show');
      return;
    }
    this.showView(initialView);

    // Position the bubble relative to the target element
    // TODO: It make the bubble jump when the bubble is opened
    setTimeout(() => this.positionBubble(targetElement), 0);

    // Attach outside click/escape listeners using the bubble element, not the toolbar button
    const bubbleEl = this.bubbleElement?.nativeElement;
    if (bubbleEl) {
      this.eventManager.attach(this.config.pluginKey, bubbleEl, this.hideBubble.bind(this), targetElement);
    }

    this.cdr.markForCheck();
  }

  /**
   * Hide the bubble menu
   */
  hideBubble(): void {
    this.isVisible = false;
    this.eventManager.detach(this.config.pluginKey);
    this.destroyCurrentView();
    this.cdr.markForCheck();
  }

  private selectInitialView(attrs: Record<string, unknown>, requestedViewId?: string): string | null {
    const config = this.config;

    if (requestedViewId && this.findViewConfig(requestedViewId)) return requestedViewId;

    // Find first view that matches showWhen condition
    for (const v of config.views) {
      if (!v.showWhen || v.showWhen(attrs)) return v.id;
    }

    // Fall back to default view
    const defaultView = config.views.find((v) => v.isDefault);
    if (defaultView) return defaultView.id;

    // If no default, use first view
    return config.views[0]?.id || null;
  }

  private showView(viewId: string): void {
    // If already showing this view, do nothing
    if (this.currentViewId === viewId && this.currentViewRef) {
      return;
    }

    // Find view config
    const viewConfig = this.findViewConfig(viewId);
    if (!viewConfig) {
      console.error(`[ToolbarBubbleMenu] View not found: ${viewId}`);
      return;
    }

    // Destroy current view if exists
    if (this.currentViewRef) {
      this.deactivateView(this.currentViewRef);
      this.currentViewRef.destroy();
      this.currentViewRef = null;
    }

    this.currentViewRef = this.createView(viewConfig);
    this.currentViewId = viewId;

    // Activate new view
    this.activateView(this.currentViewRef);

    // Re-setup focus trap after view is created (focusable elements may have changed)
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      setTimeout(() => {
        this.focusTrap.reattach(bubbleElement, true);
      }, 0);
    }
  }

  private createView(viewConfig: BubbleMenuViewConfig): ComponentRef<BubbleMenuViewContent> {
    if (!this.viewContainer) {
      throw new Error('[ToolbarBubbleMenu] View container not found');
    }

    // Clear container
    this.viewContainer.clear();

    // Create component with proper environment injector (standalone support)
    const envInjector = this.viewContainer.injector.get(EnvironmentInjector);
    const componentRef = this.viewContainer.createComponent(viewConfig.component, {
      environmentInjector: envInjector,
    });

    // Inject dependencies
    const instance = componentRef.instance;
    instance.editor = this.editor;
    instance.viewId = viewConfig.id;
    instance.navigateTo = this.handleNavigateTo.bind(this);
    instance.goBack = this.handleGoBack.bind(this);
    instance.close = this.hideBubble.bind(this);

    return componentRef;
  }

  private activateView(componentRef: ComponentRef<BubbleMenuViewContent>): void {
    if (!componentRef.instance.onActivate) return;
    componentRef.instance.onActivate(this.currentAttributes);
  }

  private deactivateView(componentRef: ComponentRef<BubbleMenuViewContent>): void {
    if (!componentRef.instance.onDeactivate) return;
    componentRef.instance.onDeactivate();
  }

  private destroyCurrentView(): void {
    if (!this.currentViewRef) return;

    this.deactivateView(this.currentViewRef);
    this.currentViewRef.destroy();
    this.currentViewRef = null;
    this.currentViewId = null;
  }

  private handleNavigateTo(viewId: string): void {
    if (!this.findViewConfig(viewId)) {
      console.error(`[ToolbarBubbleMenu] Cannot navigate to non-existent view: ${viewId}`);
      return;
    }
    this.showView(viewId);
  }

  private handleGoBack(viewId?: string): void {
    if (viewId) {
      this.handleNavigateTo(viewId);
      return;
    }
    this.hideBubble();
  }

  private findViewConfig(viewId: string): BubbleMenuViewConfig | null {
    return this.config.views.find((v) => v.id === viewId) || null;
  }

  private positionBubble(targetElement: HTMLElement): void {
    const bubble = this.bubbleElement?.nativeElement;
    if (!bubble) return;

    const targetRect = targetElement.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position: below the target element, centered
    let top = targetRect.bottom + 8;
    let left = targetRect.left + targetRect.width / 2 - bubbleRect.width / 2;

    // Adjust horizontal position to stay within viewport
    if (left < 8) {
      left = 8;
    } else if (left + bubbleRect.width > viewportWidth - 8) {
      left = viewportWidth - bubbleRect.width - 8;
    }

    // If bubble would go below viewport, position it above the target
    if (top + bubbleRect.height > viewportHeight - 8) {
      top = targetRect.top - bubbleRect.height - 8;
    }

    // Apply position
    bubble.style.position = 'fixed';
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  }
}
