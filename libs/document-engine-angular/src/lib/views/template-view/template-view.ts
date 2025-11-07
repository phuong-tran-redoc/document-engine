import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TemplateItem } from '@redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BubbleMenuViewContent } from '../../core';
import { ButtonDirective, IconComponent, InputDirective, LabelDirective } from '../../ui';

/**
 * Template view for bubble menu
 * Shows templates for insertion into the editor
 * Replaces entire editor content with selected template
 */
@Component({
  selector: 'document-engine-template-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, InputDirective, LabelDirective, IconComponent],
  template: `
    <div class="template-view">
      <!-- Title -->
      <div class="template-view__header">Templates</div>

      <!-- Search Bar -->
      <div class="template-view__search">
        <div class="template-view__search-field">
          <label documentEngineLabel for="search-input">Search templates</label>
          <div class="template-view__search-input-wrapper">
            <document-engine-icon name="search" class="template-view__search-icon"></document-engine-icon>
            <input
              documentEngineInput
              id="search-input"
              [formControl]="searchControl"
              placeholder="Search templates..."
              aria-label="Search templates"
            />
          </div>
        </div>
      </div>

      <!-- Templates List -->
      <div class="template-view__list-container">
        <div *ngIf="filteredTemplates.length > 0; else noResults" class="template-view__list">
          <button
            *ngFor="let template of filteredTemplates"
            type="button"
            class="template-view__template-item"
            (click)="insertTemplate(template)"
            [attr.aria-label]="template.title + (template.description ? ' - ' + template.description : '')"
            [title]="template.description || template.title"
          >
            <div class="template-view__template-title">{{ template.title }}</div>
            <div *ngIf="template.description" class="template-view__template-description">
              {{ template.description }}
            </div>
          </button>
        </div>

        <ng-template #noResults>
          <div class="template-view__empty">
            <document-engine-icon name="search_off" class="template-view__empty-icon"></document-engine-icon>
            <div class="template-view__empty-text">No templates found matching "{{ searchQuery }}"</div>
          </div>
        </ng-template>
      </div>

      <!-- Actions -->
      <div class="template-view__actions">
        <button type="button" documentEngineButton variant="secondary" (click)="close?.()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./template-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateViewComponent implements BubbleMenuViewContent<Record<string, unknown>>, OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  editor?: Editor;
  close?: () => void;
  goBack?: (viewId?: string) => void;
  navigateTo?: (viewId: string) => void;

  searchQuery = '';
  originalTemplates: TemplateItem[] = [];

  // Reactive form control for search
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  onActivate(attrs: Record<string, unknown>): void {
    const templates = attrs['templates'] as TemplateItem[];
    if (!templates) throw new Error('Templates are required');
    this.originalTemplates = templates;
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
   * Getter that filters templates based on search query
   */
  get filteredTemplates(): TemplateItem[] {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) return this.originalTemplates;

    // Filter templates based on search query
    return this.originalTemplates.filter(
      (template) => template.title.toLowerCase().includes(query) || template.description?.toLowerCase().includes(query)
    );
  }

  /**
   * Insert a template into the editor, replacing entire content
   */
  insertTemplate(template: TemplateItem): void {
    if (!this.editor) return;

    // Replace entire editor content with template data
    this.editor.chain().focus().setContent(template.data).run();
    this.close?.();
  }
}
