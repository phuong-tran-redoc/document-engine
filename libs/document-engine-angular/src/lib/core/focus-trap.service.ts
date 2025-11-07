import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Service to manage focus trapping within an element
 * Traps keyboard focus inside a container element for accessibility
 */
@Injectable({ providedIn: 'root' })
export class FocusTrapService {
  private document = inject(DOCUMENT);
  private activeTraps = new Map<
    HTMLElement,
    {
      handler: (event: KeyboardEvent) => void;
      firstElement: HTMLElement | null;
      lastElement: HTMLElement | null;
    }
  >();

  /**
   * Attach focus trap to an element
   * @param element The container element to trap focus within
   * @param autoFocus Whether to automatically focus the first focusable element
   */
  attach(element: HTMLElement, autoFocus = true): void {
    if (!element) return;

    // Detach existing trap if any
    this.detach(element);

    // Get all focusable elements within the container
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus the first element if requested
    if (autoFocus && firstFocusableElement) {
      setTimeout(() => {
        firstFocusableElement.focus();
      }, 0);
    }

    // Handle Tab key to trap focus
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (!element.contains(this.document.activeElement)) {
        event.preventDefault();
        if (event.shiftKey) {
          lastFocusableElement?.focus();
        } else {
          firstFocusableElement?.focus();
        }
        return;
      }

      if (event.shiftKey) {
        // Shift + Tab: going backwards
        if (this.document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab: going forwards
        if (this.document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handler);

    this.activeTraps.set(element, {
      handler,
      firstElement: firstFocusableElement,
      lastElement: lastFocusableElement,
    });
  }

  /**
   * Detach focus trap from an element
   * @param element The element to remove focus trap from
   */
  detach(element: HTMLElement): void {
    if (!element) return;

    const trap = this.activeTraps.get(element);
    if (trap) {
      element.removeEventListener('keydown', trap.handler);
      this.activeTraps.delete(element);
    }
  }

  /**
   * Detach all active focus traps
   */
  detachAll(): void {
    this.activeTraps.forEach((trap, element) => {
      element.removeEventListener('keydown', trap.handler);
    });
    this.activeTraps.clear();
  }

  /**
   * Re-attach focus trap to an element (useful when content changes)
   * @param element The element to re-attach focus trap to
   * @param autoFocus Whether to automatically focus the first focusable element
   */
  reattach(element: HTMLElement, autoFocus = false): void {
    this.detach(element);
    this.attach(element, autoFocus);
  }
}
