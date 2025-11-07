import { Component, inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumb, BreadcrumbItem } from '@shared/ui/breadcrumb';
import { DocumentEngineSidebarService } from '../sidebar';
import { DocumentEngineThemeToggleComponent } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'document-engine-header',
  templateUrl: './header.html',
  imports: [DocumentEngineThemeToggleComponent, Breadcrumb, MatIconModule, MatButtonModule, MatRippleModule],
  styles: [
    `
      :host {
        position: sticky;
        top: 0;
        width: 100%;
        display: flex;
        z-index: 1;
      }
    `,
  ],
})
export class DocumentEngineHeaderComponent {
  private readonly sidebarService: DocumentEngineSidebarService = inject(DocumentEngineSidebarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  breadcrumbItems = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.buildBreadcrumbItems()),
    ),
    { initialValue: this.buildBreadcrumbItems() as BreadcrumbItem[] },
  );

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  private buildBreadcrumbItems(): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];
    let url = '';
    let current = this.router.routerState.snapshot.root;

    while (current) {
      const segment = current.url.map((u) => u.path).join('/');
      if (segment) {
        url += `/${segment}`;
      }

      const label = this.getLabel(current);
      if (label) {
        items.push({ label, url: url || '/' });
      }

      current = current.firstChild as typeof current;
    }

    return items;
  }

  private getLabel(route: ActivatedRouteSnapshot): string | null {
    const data = route.data as Record<string, unknown> | undefined;
    const labelFromData = (data?.['breadcrumb'] as string) || (data?.['title'] as string);
    return labelFromData ?? null;
  }
}
