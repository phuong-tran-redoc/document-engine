import { Injectable, signal, computed, inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserverService, BreakpointState } from '@shared/features/breakpoint-observer';
import { SidebarExpandVariant, SidebarState } from '@shared/ui/sidebar';

@Injectable({
  providedIn: 'root',
})
export class DocumentEngineSidebarService {
  private readonly _state = signal<SidebarState>('open');
  private readonly breakpointService = inject(BreakpointObserverService);

  // Programmatic override for expand variant; null means use responsive value
  private readonly _expandVariantOverride = signal<SidebarExpandVariant | null>(null);

  // Observe breakpoint changes
  private readonly _breakpoint = toSignal<BreakpointState>(this.breakpointService.observe());

  // Computed expand variant, responsive by default, overridable programmatically
  private readonly _expandVariant = computed<SidebarExpandVariant>(() => {
    const override = this._expandVariantOverride();
    if (override) {
      return override;
    }

    const bp = this._breakpoint()?.name;
    return bp === 'tablet' ? 'compact' : 'full';
  });

  /**
   * Current state of the sidebar
   */
  public readonly state: Signal<SidebarState> = this._state.asReadonly();

  /**
   * Current expand variant signal (read-only)
   */
  public readonly expandVariant: Signal<SidebarExpandVariant> = this._expandVariant;

  /**
   * Toggles the sidebar between open and close states
   */
  public toggle(): void {
    this._state.update((currentState) => (currentState === 'open' ? 'close' : 'open'));
  }

  /**
   * Opens the sidebar
   */
  public open(): void {
    this._state.set('open');
  }

  /**
   * Closes the sidebar
   */
  public close(): void {
    this._state.set('close');
  }

  /**
   * Sets the sidebar to a specific state
   */
  public setState(state: SidebarState): void {
    this._state.set(state);
  }

  /**
   * Sets a programmatic override for the expand variant. Pass null to clear.
   */
  public setExpandVariant(variant: SidebarExpandVariant | null): void {
    this._expandVariantOverride.set(variant);
  }

  /**
   * Clears the programmatic override, falling back to responsive behavior.
   */
  public clearExpandVariant(): void {
    this._expandVariantOverride.set(null);
  }
}
