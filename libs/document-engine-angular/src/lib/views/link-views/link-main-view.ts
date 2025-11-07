import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core';
import { ButtonDirective } from '../../ui/button';
import { IconComponent } from '../../ui/icon';

interface LinkAttrs {
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Main view for link bubble menu
 * Shows when an existing link is selected
 * Provides navigation to edit and properties views
 */
@Component({
  selector: 'notum-link-main-view',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconComponent],
  template: `
    <div class="link-main-view">
      <!-- Title -->
      <div class="link-main-view__header">Link</div>

      <!-- Content -->
      <div class="link-main-view__content">
        <a class="link-main-view__url" [title]="currentUrl" [href]="currentUrl" target="_blank">
          {{ currentUrl }}
        </a>

        <button notumButton variant="ghost" size="sm" class="link-main-view__button" (click)="editLink()">
          <notum-icon name="edit"></notum-icon>
          <span>Edit</span>
        </button>

        <button notumButton variant="ghost" size="sm" class="link-main-view__button" (click)="openProperties()">
          <notum-icon name="settings"></notum-icon>
          <span>Properties</span>
        </button>

        <button
          notumButton
          variant="ghost"
          size="icon-sm"
          class="link-main-view__button-icon"
          (click)="removeLink()"
          title="Remove link"
        >
          <notum-icon name="link_off"></notum-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./link-main-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMainViewComponent implements BubbleMenuViewContent<LinkAttrs> {
  editor?: Editor;
  currentUrl = '';

  close?: () => void;
  navigateTo?: (viewId: string) => void;

  constructor(private cdr: ChangeDetectorRef) {}

  onActivate(attrs: LinkAttrs): void {
    this.currentUrl = attrs.href || '';
    this.cdr.markForCheck();
  }

  editLink(): void {
    this.navigateTo?.('edit');
  }

  openProperties(): void {
    this.navigateTo?.('properties');
  }

  removeLink(): void {
    this.editor?.chain().focus().unsetLink().run();
    this.close?.();
  }
}
