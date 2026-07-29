import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core/bubble-menu/bubble-menu.type';
import { ButtonDirective } from '../../ui/button';
import { CheckboxComponent } from '../../ui/checkbox/checkbox';

interface LinkAttrs {
  href?: string;
  target?: string;
  rel?: string;
}

/**
 * Properties view for link bubble menu
 * Shows link properties like target and rel attributes
 * Allows user to configure SEO and security settings
 */
@Component({
  selector: 'document-engine-link-properties-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, CheckboxComponent],
  template: `
    <div class="link-properties-view">
      <!-- Title -->
      <!-- No referrer -->
      <div class="link-properties-view__header">Link Properties</div>

      <!-- Content -->
      <div class="link-properties-view__content">
        <!-- Open in new tab -->
        <div class="link-properties-view__option">
          <document-engine-checkbox [formControl]="newTabControl">Open in new tab</document-engine-checkbox>
        </div>

        <!-- No follow -->
        <div class="link-properties-view__option">
          <document-engine-checkbox [formControl]="noFollowControl">
            Add <code class="inline-code">rel="nofollow"</code>
          </document-engine-checkbox>
        </div>

        <!-- No opener -->
        <div class="link-properties-view__option">
          <document-engine-checkbox [formControl]="noOpenerControl">
            Add <code class="inline-code">rel="noopener"</code>
          </document-engine-checkbox>
        </div>

        <!-- No referrer -->
        <div class="link-properties-view__option">
          <document-engine-checkbox [formControl]="noReferrerControl">
            Add <code class="inline-code">rel="noreferrer"</code>
          </document-engine-checkbox>
        </div>
      </div>

      <!-- Actions -->
      <div class="link-properties-view__actions">
        <button documentEngineButton variant="ghost" (click)="cancel()">Cancel</button>

        <button type="submit" documentEngineButton variant="default" (click)="saveProperties()">Save</button>
      </div>
    </div>
  `,
  styleUrls: ['./link-properties-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPropertiesViewComponent implements BubbleMenuViewContent<LinkAttrs> {
  editor?: Editor;
  goBack?: (viewId?: string) => void;

  newTabControl = new FormControl(false);
  noFollowControl = new FormControl(false);
  noOpenerControl = new FormControl(false);
  noReferrerControl = new FormControl(false);

  private currentHref = '';

  constructor(private cdr: ChangeDetectorRef) {}

  onActivate(attrs: LinkAttrs): void {
    this.currentHref = attrs.href || '';

    // Parse existing attributes
    this.newTabControl.setValue(attrs.target === '_blank');

    const rel = attrs.rel || '';
    this.noFollowControl.setValue(rel.includes('nofollow'));
    this.noOpenerControl.setValue(rel.includes('noopener'));
    this.noReferrerControl.setValue(rel.includes('noreferrer'));

    this.cdr.markForCheck();
  }

  saveProperties(): void {
    if (!this.editor || !this.currentHref) return;

    // Build rel attribute
    const relParts: string[] = [];
    if (this.noFollowControl.value) relParts.push('nofollow');
    if (this.noOpenerControl.value) relParts.push('noopener');
    if (this.noReferrerControl.value) relParts.push('noreferrer');

    // Update link attributes
    this.editor
      .chain()
      .focus()
      .setLink({
        href: this.currentHref,
        target: this.newTabControl.value ? '_blank' : undefined,
        rel: relParts.length > 0 ? relParts.join(' ') : undefined,
      })
      .run();

    this.goBack?.('main'); // Always go back to main after saving
  }

  cancel(): void {
    this.goBack?.('main'); // Always go back to main on cancel
  }
}
