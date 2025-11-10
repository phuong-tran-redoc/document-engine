import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldCategory, DynamicFieldItem } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BubbleMenuViewContent } from '../../core';
import { ButtonDirective, IconComponent, InputDirective, LabelDirective } from '../../ui';

/**
 * Dynamic fields view for bubble menu
 * Shows categorized dynamic fields for insertion into the editor
 */
@Component({
  selector: 'document-engine-dynamic-fields-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, InputDirective, LabelDirective, IconComponent],
  template: `
    <div class="dynamic-fields-view">
      <!-- Title -->
      <div class="dynamic-fields-view__header">Dynamic Fields</div>

      <!-- Search Bar -->
      <div class="dynamic-fields-view__search">
        <div class="dynamic-fields-view__search-field">
          <label documentEngineLabel for="search-input">Search merge field</label>
          <div class="dynamic-fields-view__search-input-wrapper">
            <document-engine-icon name="search" class="dynamic-fields-view__search-icon"></document-engine-icon>
            <input
              documentEngineInput
              id="search-input"
              [formControl]="searchControl"
              placeholder="Search fields..."
              aria-label="Search dynamic fields"
            />
          </div>
        </div>
      </div>

      <!-- Fields List -->
      <div class="dynamic-fields-view__list-container">
        <div *ngIf="filteredCategories.length > 0; else noResults" class="dynamic-fields-view__list">
          <div *ngFor="let category of filteredCategories; let isLast = last" class="dynamic-fields-view__category">
            <div class="dynamic-fields-view__category-header">{{ category.label }}</div>

            <div class="dynamic-fields-view__fields">
              <button
                *ngFor="let field of category.fields"
                type="button"
                class="dynamic-fields-view__field-item"
                (click)="insertDynamicField(field)"
                [attr.aria-label]="field.label + (field.description ? ' - ' + field.description : '')"
                [title]="field.description || field.label"
              >
                <div class="dynamic-fields-view__field-label">{{ field.label }}</div>
                <div *ngIf="field.description" class="dynamic-fields-view__field-description">
                  {{ field.description }}
                </div>
              </button>
            </div>

            <div *ngIf="!isLast" class="dynamic-fields-view__divider"></div>
          </div>
        </div>

        <ng-template #noResults>
          <div class="dynamic-fields-view__empty">
            <document-engine-icon name="search_off" class="dynamic-fields-view__empty-icon"></document-engine-icon>
            <div class="dynamic-fields-view__empty-text">No fields found matching "{{ searchQuery }}"</div>
          </div>
        </ng-template>
      </div>

      <!-- Actions -->
      <div class="dynamic-fields-view__actions">
        <button type="button" documentEngineButton variant="secondary" (click)="close?.()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./dynamic-fields-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldsViewComponent implements BubbleMenuViewContent<Record<string, unknown>>, OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  editor?: Editor;
  close?: () => void;
  goBack?: (viewId?: string) => void;
  navigateTo?: (viewId: string) => void;

  searchQuery = '';
  originalFields: DynamicFieldItem[] = [];
  originalCategories: DynamicFieldCategory[] = [];

  // Reactive form control for search
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  onActivate(attrs: Record<string, unknown>): void {
    const categories = attrs['categories'] as DynamicFieldCategory[];
    if (!categories) throw new Error('Categories are required');
    this.originalCategories = categories;
    this.originalFields = categories.flatMap((category) => category.fields);
    this.searchQuery = '';
    this.searchControl.setValue('');
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    // Set up reactive form subscription with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchQuery = value || '';
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Getter that filters categories and fields based on search query
   */
  get filteredCategories(): DynamicFieldCategory[] {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) return this.originalCategories;

    // Filter categories and fields based on search query
    return this.originalCategories
      .map((category) => {
        const categoryFields = category.fields.filter(
          (field) =>
            field.label.toLowerCase().includes(query) ||
            field.description?.toLowerCase().includes(query) ||
            field.id.toLowerCase().includes(query)
        );

        if (categoryFields.length > 0) {
          return { key: category.key, label: category.label, fields: categoryFields };
        }

        return null;
      })
      .filter((category): category is DynamicFieldCategory => category !== null);
  }

  /**
   * Insert a dynamic field into the editor
   */
  insertDynamicField(field: DynamicFieldItem): void {
    if (!this.editor) return;

    this.editor.chain().focus().insertDynamicField({ fieldId: field.id, label: field.label }).run();
    this.close?.();
  }
}
