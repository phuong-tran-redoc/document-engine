import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
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
export class PopoverDirective implements OnInit, OnChanges, OnDestroy {
  private elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * The trigger element reference (ElementRef or HTMLElement)
   */
  @Input() popover!: ElementRef<HTMLElement> | HTMLElement;

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
  private isPositioned = false;

  ngOnInit(): void {
    this.updateVisibility();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['popover']) {
      this.updateVisibility();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private updateVisibility(): void {
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
    const triggerEl = this.popover instanceof ElementRef ? this.popover.nativeElement : this.popover;

    const dropdownEl = this.elRef.nativeElement;

    if (!triggerEl || !dropdownEl) return;

    // Compute initial position before showing dropdown to prevent flash
    computePosition(triggerEl, dropdownEl, {
      placement: this.placement,
      middleware: [offset(this.offset), flip(), shift({ padding: this.padding })],
    }).then(({ x, y }) => {
      // Set position first, then make visible
      Object.assign(dropdownEl.style, { left: `${x}px`, top: `${y}px` });
      this.isPositioned = true;
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
