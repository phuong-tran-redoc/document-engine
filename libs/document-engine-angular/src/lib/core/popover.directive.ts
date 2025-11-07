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
 * <div [popover]="trigger" [isOpen]="isOpen">
 *   Content
 * </div>
 */
@Directive({
  selector: '[popover]',
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
  @Input({ required: true }) popover!: ElementRef<HTMLElement> | HTMLElement;

  /**
   * Whether the popover is open
   */
  @Input({ required: true }) isOpen = false;

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
    if (this.viewInitialized && (changes['isOpen'] || changes['popover'])) {
      this.updateVisibility();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private updateVisibility(): void {
    if (!this.viewInitialized) return;

    if (this.isOpen && this.popover) {
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

    if (!this.popover) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this._setupFloatingInternal(), 10);
      }
      return;
    }

    if (this.popover instanceof ElementRef) {
      triggerEl = this.popover.nativeElement;
      // If ElementRef exists but nativeElement is not yet available, retry
      if (!triggerEl) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => this._setupFloatingInternal(), 10);
        }
        return;
      }
    } else {
      triggerEl = this.popover;
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
    computePosition(triggerEl, dropdownEl, {
      placement: this.placement,
      middleware: [offset(this.offset), flip(), shift({ padding: this.padding })],
    })
      .then(({ x, y }) => {
        // Set position first, then make visible
        Object.assign(dropdownEl.style, { left: `${x}px`, top: `${y}px` });
        this.isPositioned = true;
        // Trigger change detection to update visibility binding
        this.cdr.markForCheck();
      })
      .catch((error) => {
        console.error('[PopoverDirective] Error computing position', error);
      });

    // Use autoUpdate to automatically reposition on scroll/resize
    this.cleanupAutoUpdate = autoUpdate(triggerEl, dropdownEl, () => {
      computePosition(triggerEl, dropdownEl, {
        placement: this.placement,
        middleware: [offset(this.offset), flip(), shift({ padding: this.padding })],
      }).then(({ x, y }) => {
        Object.assign(dropdownEl.style, { left: `${x}px`, top: `${y}px` });
      });
    });
  }

  private cleanup(): void {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
  }
}
