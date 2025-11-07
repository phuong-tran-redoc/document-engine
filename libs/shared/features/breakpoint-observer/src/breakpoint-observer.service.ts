import { BreakpointObserver } from '@angular/cdk/layout';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, ReplaySubject } from 'rxjs';
import { DEFAULT_BREAKPOINTS } from './breakpoint.constant';
import { BreakpointConfig, BreakpointState } from './breakpoint.type';

interface CachedBreakpointObserver {
  config: BreakpointConfig;
  subject: ReplaySubject<BreakpointState>;
}

@Injectable({
  providedIn: 'root',
})
export class BreakpointObserverService {
  private readonly cdkBreakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  // Cache for different breakpoint configurations
  private readonly observerCache = new Map<string, CachedBreakpointObserver>();

  /**
   * Creates an observable that tracks the current active breakpoint
   * @param breakpoints - Object with breakpoint names as keys and media query strings as values
   * @returns Observable that emits the current active breakpoint state
   *
   * Example:
   * ```typescript
   * this.breakpointObserver.observe({
   *   mobile: '(max-width: 768px)',
   *   tablet: '(max-width: 1024px)',
   *   desktop: '(max-width: 1200px)',
   * }).subscribe(breakpoint => {
   *   console.log('Current breakpoint:', breakpoint);
   * });
   * ```
   */
  observe(breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS): Observable<BreakpointState> {
    const configKey = this.getConfigKey(breakpoints);

    // Return cached observer if it exists
    const cached = this.observerCache.get(configKey);
    if (cached) return cached.subject.asObservable();

    // Create new ReplaySubject and cache it
    const subject = new ReplaySubject<BreakpointState>(1);

    const cachedObserver: CachedBreakpointObserver = { config: breakpoints, subject };

    this.observerCache.set(configKey, cachedObserver);
    this.setupBreakpointObserver(breakpoints, subject);

    return subject.asObservable();
  }

  private getConfigKey(breakpoints: BreakpointConfig): string {
    // Create a consistent key from the breakpoint configuration
    return JSON.stringify(breakpoints);
  }

  private setupBreakpointObserver(
    breakpoints: BreakpointConfig,
    subject: ReplaySubject<BreakpointState>,
  ): void {
    const mediaQueries = Object.values(breakpoints);

    this.cdkBreakpointObserver
      .observe(mediaQueries)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const matchResults: Record<string, boolean> = {};

        Object.entries(breakpoints).forEach(([name, mediaQuery]) => {
          matchResults[name] = result.breakpoints[mediaQuery] || false;
        });

        const currentBreakpoint = this.getCurrentBreakpointState(breakpoints, matchResults);

        subject.next(currentBreakpoint);
      });
  }

  private getCurrentBreakpointState(
    breakpoints: BreakpointConfig,
    matches: Record<string, boolean>,
  ): BreakpointState {
    // Find the first matching breakpoint (priority based on order in config)
    for (const [name, mediaQuery] of Object.entries(breakpoints)) {
      if (matches[name]) {
        return {
          name,
          mediaQuery,
          isActive: true,
        };
      }
    }

    // If no breakpoint matches, return the first one as inactive
    const firstEntry = Object.entries(breakpoints)[0];
    if (firstEntry) {
      const [name, mediaQuery] = firstEntry;
      return {
        name,
        mediaQuery,
        isActive: false,
      };
    }

    // Fallback if no breakpoints defined
    return {
      name: '',
      mediaQuery: '',
      isActive: false,
    };
  }
}
