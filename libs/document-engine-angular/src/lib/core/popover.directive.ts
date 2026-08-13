import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { computePosition, flip, offset, shift, autoUpdate, Placement } from '@floating-ui/dom';

/**
 * Directive for positioning a popover/dropdown relative to a trigger element using floating-ui
 * Handles positioning, visibility, and cleanup automatically
 *
 * Usage:
 * <button #trigger>Open</button>
 * <div [documentEnginePopover]="trigger" [isOpen]="isOpen">
 *   Content
 * </div>
 *
 * The host is pinned `position: fixed`, so floating-ui is asked for viewport-
 * relative coordinates (`strategy: 'fixed'`). Omitting the strategy yields
 * offset-parent-relative numbers, which are off by the page's scroll offset
 * once written onto a fixed element.
 */
@Directive({
  // `documentEnginePopover` is the supported selector. `[popover]` is kept as a
  // deprecated alias for consumers on <= 0.1.4; it collides with the platform's
  // native popover attribute and will be removed in the next major.
  selector: '[documentEnginePopover], [popover]',
  standalone: true,
  host: {
    '[style.position]': '"fixed"',
    '[style.visibility]': 'isPositioned ? "visible" : "hidden"',
  },
})
export class PopoverDirective implements OnChanges, AfterViewInit, OnDestroy {
  private elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  /**
   * The trigger element reference (ElementRef or HTMLElement)
   */
  @Input() documentEnginePopover?: ElementRef<HTMLElement> | HTMLElement;

  /**
   * The trigger element reference (ElementRef or HTMLElement)
   *
   * @deprecated Use `documentEnginePopover`. `[popover]` collides with the
   * native HTML popover attribute and will be removed in the next major.
   */
  @Input() popover?: ElementRef<HTMLElement> | HTMLElement;

  /** The trigger, whichever input supplied it. */
  private get trigger(): ElementRef<HTMLElement> | HTMLElement | undefined {
    return this.documentEnginePopover ?? this.popover;
  }

  /**
   * Whether the popover is open
   */
  @Input() isOpen = false;

  /**
   * Placement of the popover relative to trigger
   */
  @Input() placement: Placement = 'bottom-start';

  /**
   * Offset from trigger
   */
  @Input() offset = 8;

  /**
   * Padding for flip/shift middleware
   */
  @Input() padding = 8;

  private cleanupAutoUpdate?: () => void;
  isPositioned = false;
  private viewInitialized = false;
  private retryCount = 0;
  private readonly maxRetries = 10;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.updateVisibility();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.viewInitialized &&
      (changes['isOpen'] || changes['popover'] || changes['documentEnginePopover'])
    ) {
      this.updateVisibility();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private updateVisibility(): void {
    if (!this.viewInitialized) return;

    if (this.isOpen && this.trigger) {
      // Wait for next tick to ensure element is rendered
      setTimeout(() => {
        this.setupFloating();
      });
    } else {
      this.isPositioned = false;
      this.cleanup();
    }
  }

  private setupFloating(): void {
    // Reset retry count on each attempt
    this.retryCount = 0;
    this._setupFloatingInternal();
  }

  private _setupFloatingInternal(): void {
    let triggerEl: HTMLElement | undefined;
    const trigger = this.trigger;

    if (!trigger) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this._setupFloatingInternal(), 10);
      }
      return;
    }

    if (trigger instanceof ElementRef) {
      triggerEl = trigger.nativeElement;
      // If ElementRef exists but nativeElement is not yet available, retry
      if (!triggerEl) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => this._setupFloatingInternal(), 10);
        }
        return;
      }
    } else {
      triggerEl = trigger;
    }

    const dropdownEl = this.elRef.nativeElement;

    if (!triggerEl || !dropdownEl) {
      // Retry if elements not ready
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this._setupFloatingInternal(), 10);
      }
      return;
    }

    // Compute initial position before showing dropdown to prevent flash
    this.reposition(triggerEl, dropdownEl)
      .then(() => {
        this.isPositioned = true;
        // Trigger change detection to update visibility binding
        this.cdr.markForCheck();
      })
      .catch((error) => {
        console.error('[PopoverDirective] Error computing position', error);
      });

    // Use autoUpdate to automatically reposition on scroll/resize. It must use
    // the SAME strategy as the initial call, or the first scroll undoes the fix.
    this.cleanupAutoUpdate = autoUpdate(triggerEl, dropdownEl, () => {
      void this.reposition(triggerEl as HTMLElement, dropdownEl);
    });
  }

  /**
   * Position `dropdownEl` against `triggerEl`.
   *
   * `strategy: 'fixed'` is required: the host binding pins this element to
   * `position: fixed`, so the coordinates must be viewport-relative. Without it
   * floating-ui returns offset-parent-relative numbers and the panel lands the
   * page's scroll offset away from its trigger.
   */
  private reposition(triggerEl: HTMLElement, dropdownEl: HTMLElement): Promise<void> {
    return computePosition(triggerEl, dropdownEl, {
      strategy: 'fixed',
      placement: this.placement,
      middleware: [offset(this.offset), flip(), shift({ padding: this.padding })],
    }).then(({ x, y }) => {
      Object.assign(dropdownEl.style, { left: `${x}px`, top: `${y}px` });
    });
  }

  private cleanup(): void {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
  }
}
