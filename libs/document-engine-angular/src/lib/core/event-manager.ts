import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export type OutsideHandler = (e: Event) => void;

@Injectable({ providedIn: 'root' })
export class EventManager {
  private document = inject(DOCUMENT);
  private keyToEscapeListener = new Map<string, OutsideHandler>();
  private keyToOutsideListener = new Map<string, OutsideHandler>();

  isAttached(key: string): boolean {
    return this.keyToOutsideListener.has(key) || this.keyToEscapeListener.has(key);
  }

  attach(key: string, hostElement: HTMLElement, cb: (key: string) => void, anchorElement?: HTMLElement): void {
    // Avoid duplicate listeners
    this.detach(key);

    const oldOutside = this.keyToOutsideListener.get(key);
    if (!oldOutside) {
      const handler: OutsideHandler = (event: Event) => {
        const target = event.target as Node | null;
        const path = (event as unknown as { composedPath?: () => EventTarget[] }).composedPath?.();

        // Check if click is inside bubble
        const isInsideBubble =
          !!hostElement && ((!!target && hostElement.contains(target)) || (!!path && path.includes(hostElement)));
        if (isInsideBubble) return;

        // Check if click is on the anchor (toolbar button)
        const isInsideAnchor =
          !!anchorElement && ((!!target && anchorElement.contains(target)) || (!!path && path.includes(anchorElement)));
        if (isInsideAnchor) return;

        // Check if click is inside a CDK overlay (e.g., MatSelect dropdown, MatMenu, etc.)
        // These are rendered outside the bubble but should not close it
        if (target instanceof Element) {
          const isInsideOverlay = target.closest('.cdk-overlay-container, .cdk-overlay-pane');
          if (isInsideOverlay) return;
        }

        cb(key);
      };

      this.keyToOutsideListener.set(key, handler);

      this.document.addEventListener('pointerdown', handler, true);
      this.document.addEventListener('mousedown', handler, true);
      this.document.addEventListener('click', handler, true);
    }

    const oldEsc = this.keyToEscapeListener.get(key);
    if (!oldEsc) {
      const escHandler = (e: Event) => (e as KeyboardEvent).key === 'Escape' && cb(key);
      this.document.addEventListener('keydown', escHandler, true);
      this.keyToEscapeListener.set(key, escHandler);
    }
  }

  detach(key: string): void {
    const outside = this.keyToOutsideListener.get(key);
    if (outside) {
      this.document.removeEventListener('pointerdown', outside, true);
      this.document.removeEventListener('mousedown', outside, true);
      this.document.removeEventListener('click', outside, true);
      this.keyToOutsideListener.delete(key);
    }

    const esc = this.keyToEscapeListener.get(key);
    if (esc) {
      this.document.removeEventListener('keydown', esc, true);
      this.keyToEscapeListener.delete(key);
    }
  }
}
