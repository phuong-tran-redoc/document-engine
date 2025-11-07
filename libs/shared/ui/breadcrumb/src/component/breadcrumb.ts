import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, inject, input, output, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { BREADCRUMB_CONFIG } from '../configs';
import { BreadcrumbItem, BreadcrumbItemType, BreadcrumbSeparator } from '../types';

@Component({
  selector: 'document-engine-breadcrumb',
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  private readonly config = inject(BREADCRUMB_CONFIG);

  // Required inputs
  items = input.required<BreadcrumbItem[]>();

  // Optional inputs (with injected defaults)
  separator = input<BreadcrumbSeparator>(this.config.separator);
  separatorTemplate = contentChild<TemplateRef<unknown>>('separatorTemplate');
  showHomeIcon = input<boolean>(this.config.showHomeIcon);
  maxItems = input<number>(this.config.maxItems);
  mobileMaxItems = input<number>(this.config.mobileMaxItems);

  // Events
  itemClick = output<BreadcrumbItem>();

  protected get shouldShowDropdown(): boolean {
    return this.items().length > this.maxItems();
  }

  protected get firstItem(): BreadcrumbItem | null {
    const items = this.items();
    return items.length > 0 ? items[0] : null;
  }

  protected get lastItems(): BreadcrumbItem[] {
    const items = this.items();
    const maxItems = this.maxItems();

    if (items.length <= maxItems) {
      return items;
    }

    // Show last 2 items when dropdown is needed
    return items.slice(-2);
  }

  protected get dropdownItems(): BreadcrumbItem[] {
    const items = this.items();
    const maxItems = this.maxItems();

    if (items.length <= maxItems) {
      return [];
    }

    // Show middle items (skip first and last 2)
    return items.slice(1, -2);
  }

  protected get displayItems(): BreadcrumbItem[] {
    const items = this.items();
    const maxItems = this.maxItems();

    if (items.length <= maxItems) {
      return items;
    }

    // When we have dropdown, show first item + dropdown indicator + last items
    const firstItem = this.firstItem;
    return firstItem ? [firstItem, ...this.lastItems] : this.lastItems;
  }

  protected get separatorIcon(): string {
    switch (this.separator()) {
      case 'chevron':
        return 'chevron_right';
      case 'slash':
        return 'keyboard_arrow_right';
      case 'arrow':
        return 'arrow_forward_ios';
      case 'dot':
        return 'fiber_manual_record';
      default:
        return 'chevron_right';
    }
  }

  protected get separatorText(): string {
    const sep = this.separator();
    if (['chevron', 'slash', 'arrow', 'dot'].includes(sep)) {
      return '';
    }
    return sep;
  }

  protected onItemClick(item: BreadcrumbItem): void {
    this.itemClick.emit(item);

    if (item.type === 'button' && item.callback) {
      item.callback();
    }
  }

  protected getItemType(item: BreadcrumbItem): BreadcrumbItemType {
    return item.type || 'link';
  }
}
