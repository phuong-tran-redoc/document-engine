import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { getClosestDomElement } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import {
  BubbleMenuViewConfig,
  BubbleMenuViewContent,
  EditorBubbleMenuConfig,
  FocusTrapService,
  selectionChangeHandler,
  shouldShowFnFactory,
  TiptapBubbleMenuDirective,
} from '../../core';

@Component({
  selector: 'document-engine-editor-bubble-menu',
  standalone: true,
  imports: [CommonModule, TiptapBubbleMenuDirective],
  template: `
    <div
      #bubbleElement
      class="bubble-menu-wrapper rounded border bg-card text-card-foreground border-border shadow-elevation-2 z-10"
      tiptapBubbleMenu
      [editor]="editor"
      [props]="config.props!"
      [mountTo]="mountTo"
      [shouldShow]="shouldShowFn"
    >
      <!-- View component will be dynamically inserted here -->
      <ng-container #viewContainer />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorBubbleMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() editor!: Editor;
  @Input() config!: EditorBubbleMenuConfig;

  @ViewChild('viewContainer', { read: ViewContainerRef }) private viewContainer!: ViewContainerRef;
  @ViewChild('bubbleElement') private bubbleElement!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);
  private focusTrap = inject(FocusTrapService);
  private currentViewRef: ComponentRef<BubbleMenuViewContent> | null = null;
  private currentViewId: string | null = null;
  private currentAttributes: Record<string, unknown> = {};
  private cleanupSelection: (() => void) | null = null;
  private shouldShowImpl: (() => boolean) | null = null;

  private keyToSignal = new Map<string, { value: boolean }>();
  private forceOpen: { value: boolean } = { value: false };
  private documentClickHandler!: (event: MouseEvent) => void;

  // Stable function reference for template binding
  shouldShowFn = () => (this.shouldShowImpl ? this.shouldShowImpl() : false);

  get mountTo() {
    const mountTo = this.config.props?.mountTo;
    if (!mountTo) return undefined;
    return () => getClosestDomElement(this.editor, mountTo);
  }

  ngOnInit(): void {
    const editor = this.editor;
    const config = this.config;

    if (!config.props?.pluginKey) {
      throw new Error('Required: Input `props.pluginKey`');
    }

    // Initialize force open signal
    this.forceOpen = this.signalFor(config.props?.pluginKey);

    // Setup shouldShow logic
    this.shouldShowImpl = shouldShowFnFactory({
      editor,
      target: config.target,
      forceOpen: () => this.forceOpen.value,
    });

    // Setup selection change handler
    this.cleanupSelection = selectionChangeHandler({
      editor,
      target: config.target,
      onActive: (attrs) => this.handleActivate(attrs),
      onInactive: () => this.handleDeactivate(),
    });

    this.addDocumentClickHandler();
  }

  ngAfterViewInit(): void {
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      this.focusTrap.attach(bubbleElement);
    }
  }

  ngOnDestroy(): void {
    if (this.cleanupSelection) {
      this.cleanupSelection();
      this.cleanupSelection = null;
    }

    this.destroyCurrentView();
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      this.focusTrap.detach(bubbleElement);
    }
    this.document.removeEventListener('mousedown', this.documentClickHandler);
  }

  private addDocumentClickHandler() {
    this.documentClickHandler = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is inside editor or its children
      const isClickInsideEditor = (this.editor.options.element as HTMLElement | undefined)?.contains(target);

      // Check if click is inside bubble menu or its children
      const isClickInsideBubbleMenu = this.bubbleElement?.nativeElement?.contains(target);

      // Check if click is inside a CDK overlay (e.g., MatSelect dropdown, MatMenu, etc.)
      // These are rendered outside the bubble but should not close it
      const isInsideOverlay =
        target instanceof Element && !!target.closest('.cdk-overlay-container, .cdk-overlay-pane');

      if (!isClickInsideEditor && !isClickInsideBubbleMenu && !isInsideOverlay) {
        // If click is completely outside, manually deactivate the bubble
        // and blur the editor to maintain correct focus state
        this.handleDeactivate();
      }
    };

    // Use mousedown for faster response than click
    this.document.addEventListener('mousedown', this.documentClickHandler);
  }

  /**
   * Public method to force open the bubble menu
   */
  showBubble(): void {
    // Select view for force-open scenario
    const viewId = this.selectInitialView({}, true);
    if (!viewId) {
      console.warn('[BubbleMenuMultiView] No view configured for force-open');
      return;
    }

    const hostElement = this.bubbleElement?.nativeElement;
    if (!hostElement) {
      console.error('[BubbleMenuMultiView] Bubble element not found');
      return;
    }

    // Open the bubble
    this.forceOpen.value = true;
    this.editor.commands.focus();
    this.editor.view.dispatch(this.editor.state.tr);

    // Attach outside click/escape listeners
    // this.eventManager.attach(this.config.pluginKey, hostElement, this.hideBubble.bind(this));

    // Show the view
    this.showView(viewId);
    this.cdr.markForCheck();
  }

  /**
   * Handle close request from view
   */
  hideBubble(): void {
    this.forceOpen.value = false;
    // this.eventManager.detach(this.config.pluginKey);
    this.destroyCurrentView();
    this.cdr.markForCheck();
  }

  /**
   * Handle when target mark/node becomes active
   */
  private handleActivate(attrs: Record<string, unknown>): void {
    this.currentAttributes = attrs;

    // Select which view to show
    const viewId = this.selectInitialView(attrs, false);

    if (!viewId) {
      console.warn('[BubbleMenuMultiView] No suitable view found for attributes:', attrs);
      return;
    }

    // Attach outside click/escape listeners
    // const bubbleElement = this.bubbleElement?.nativeElement;
    // const isAttached = this.eventManager.isAttached(this.config.pluginKey);
    // if (bubbleElement && !isAttached) {
    //   this.eventManager.attach(this.config.pluginKey, bubbleElement, this.hideBubble.bind(this));
    // }

    // If view is already showing, just update it with new attributes
    if (this.currentViewId === viewId && this.currentViewRef) {
      // Attributes changed but same view - call onActivate to update
      this.activateView(this.currentViewRef);
    } else {
      // Different view - show it
      this.showView(viewId);
    }
  }

  /**
   * Handle when target mark/node becomes inactive
   */
  private handleDeactivate(): void {
    // Mark bubble as hidden
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement) {
      bubbleElement.removeAttribute('data-visible');
    }

    // // Detach outside click/escape listeners
    // const isAttached = this.eventManager.isAttached(this.config.pluginKey);
    // if (isAttached) {
    //   this.eventManager.detach(this.config.pluginKey);
    // }

    this.destroyCurrentView();
    this.currentAttributes = {};
  }

  /**
   * Select which view should be shown initially
   */
  private selectInitialView(attrs: Record<string, unknown>, isForceOpen: boolean): string | null {
    const config = this.config;

    // If force-opening, find view with showOnForceOpen
    if (isForceOpen) {
      const forceOpenView = config.views.find((v) => v.showOnForceOpen);
      if (forceOpenView) return forceOpenView.id;
    }

    // Find first view that matches showWhen condition
    for (const view of config.views) {
      if (view.showWhen && view.showWhen(attrs)) {
        return view.id;
      }
    }

    // Fall back to default view
    const defaultView = config.views.find((v) => v.isDefault);
    if (defaultView) return defaultView.id;

    // If no default, use first view
    return config.views[0]?.id || null;
  }

  /**
   * Show a specific view by ID
   */
  private showView(viewId: string): void {
    // If already showing this view, do nothing
    if (this.currentViewId === viewId && this.currentViewRef) {
      return;
    }

    // Find view config
    const viewConfig = this.findViewConfig(viewId);
    if (!viewConfig) {
      console.error(`[BubbleMenuMultiView] View not found: ${viewId}`);
      return;
    }

    // Destroy current view if exists
    if (this.currentViewRef) {
      this.deactivateView(this.currentViewRef);
      this.currentViewRef.destroy();
      this.currentViewRef = null;
    }

    // Create new view
    this.currentViewRef = this.createView(viewConfig);
    this.currentViewId = viewId;

    // Activate new view
    this.activateView(this.currentViewRef);

    // Mark bubble as visible for transition handling
    const bubbleElement = this.bubbleElement?.nativeElement;
    if (bubbleElement && this.config.target?.requireFocus) {
      // Use requestAnimationFrame to ensure the DOM is updated first
      requestAnimationFrame(() => {
        bubbleElement.setAttribute('data-visible', 'true');
        // Re-setup focus trap after view is created (focusable elements may have changed)
        this.focusTrap.reattach(bubbleElement, true);
      });
    }
  }

  /**
   * Create a view component
   */
  private createView(viewConfig: BubbleMenuViewConfig): ComponentRef<BubbleMenuViewContent> {
    if (!this.viewContainer) {
      throw new Error('[BubbleMenuMultiView] View container not found');
    }

    // Clear container
    this.viewContainer.clear();

    // Create component
    const componentRef = this.viewContainer.createComponent(viewConfig.component);

    // Inject dependencies
    const instance = componentRef.instance;
    instance.editor = this.editor;
    instance.viewId = viewConfig.id;
    instance.navigateTo = this.handleNavigateTo.bind(this);
    instance.goBack = this.handleGoBack.bind(this);
    instance.close = this.hideBubble.bind(this);

    return componentRef;
  }

  /**
   * Activate a view (call onActivate)
   */
  private activateView(componentRef: ComponentRef<BubbleMenuViewContent>): void {
    if (!componentRef.instance.onActivate) return;
    componentRef.instance.onActivate(this.currentAttributes);
  }

  /**
   * Deactivate a view (call onDeactivate)
   */
  private deactivateView(componentRef: ComponentRef<BubbleMenuViewContent>): void {
    if (!componentRef.instance.onDeactivate) return;
    componentRef.instance.onDeactivate();
  }

  /**
   * Destroy current view
   */
  private destroyCurrentView(): void {
    if (!this.currentViewRef) return;

    this.deactivateView(this.currentViewRef);
    this.currentViewRef.destroy();
    this.currentViewRef = null;
    this.currentViewId = null;
  }

  /**
   * Handle navigation request from view
   */
  private handleNavigateTo(viewId: string): void {
    // Validate view exists
    if (!this.findViewConfig(viewId)) {
      console.error(`[BubbleMenuMultiView] Cannot navigate to non-existent view: ${viewId}`);
      return;
    }

    // Navigate to view
    this.showView(viewId);
  }

  /**
   * Handle go back request from view
   */
  private handleGoBack(viewId?: string): void {
    // Navigate to specific view
    if (viewId) {
      this.handleNavigateTo(viewId);
      return;
    }

    // Close bubble if no target specified
    this.hideBubble();
  }

  /**
   * Find view config by ID
   */
  private findViewConfig(viewId: string): BubbleMenuViewConfig | null {
    return this.config.views.find((v) => v.id === viewId) || null;
  }

  signalFor(key: string): { value: boolean } {
    let s = this.keyToSignal.get(key);
    if (!s) {
      s = { value: false };
      this.keyToSignal.set(key, s);
    }
    return s;
  }
}
