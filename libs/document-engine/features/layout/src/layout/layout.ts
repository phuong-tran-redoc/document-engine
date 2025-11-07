import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { DocumentEngineEmptyComponent } from '../empty/empty';
import { DocumentEngineHeaderComponent, DocumentEngineHeaderDirective } from '../header';
import { DocumentEngineSidebarComponent } from '../sidebar/sidebar';

type LayoutKind = 'empty' | 'classic';

@Component({
  selector: 'document-engine-layout',
  template: `
    @if (layout() === 'empty') {
    <document-engine-empty></document-engine-empty>
    } @if (layout() === 'classic') {
    <document-engine-layout-sidebar>
      <ng-template documentEngineHeader>
        <document-engine-header></document-engine-header>
      </ng-template>
    </document-engine-layout-sidebar>
    }
  `,
  imports: [
    // Layouts and header
    DocumentEngineEmptyComponent,
    DocumentEngineSidebarComponent,
    DocumentEngineHeaderComponent,
    DocumentEngineHeaderDirective,
  ],
})
export class DocumentEngineLayoutComponent {
  private readonly router = inject(Router);

  layout = signal<LayoutKind | undefined>(undefined);

  constructor() {
    // Update layout as early as possible during navigation (ActivationStart)
    // -> Cannot set ActivationStart, bug: auth user try to access login -> Layout change
    // this.router.events
    //   .pipe(
    //     filter((e): e is ActivationStart => e instanceof ActivationStart),
    //     filter((e) => e.snapshot.outlet === 'primary'),
    //     map((e) => e.snapshot.data['layout'] as LayoutKind | undefined),
    //     filter((l): l is LayoutKind => !!l),
    //     distinctUntilChanged(),
    //     takeUntilDestroyed(),
    //   )
    //   .subscribe((layout) => {
    //     this.layout.set(layout);
    //   });

    // Update layout only after a successful navigation completes
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => {
          let route = this.router.routerState.snapshot.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.data['layout'] as LayoutKind | undefined;
        }),
        filter((l): l is LayoutKind => !!l),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((layout) => {
        this.layout.set(layout);
      });
  }
}
