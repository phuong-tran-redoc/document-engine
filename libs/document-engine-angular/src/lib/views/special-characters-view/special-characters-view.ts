import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core';
import { CharacterCategory, CHARACTERS, SpecialCharacter } from '../../constants/character.constant';
import { ButtonDirective } from '../../ui/button';
import { SelectComponent } from '../../ui/select';
import { SelectOptionDirective } from '../../ui/select/select-option.directive';

/**
 * Special characters view for bubble menu
 * Shows categorized special characters for insertion
 */
@Component({
  selector: 'notum-special-characters-view',
  standalone: true,
  imports: [CommonModule, ButtonDirective, SelectComponent, SelectOptionDirective],
  template: `
    <div class="special-characters-view">
      <!-- Title -->
      <div class="special-characters-view__header">Special Characters</div>

      <!-- Category Select -->
      <div class="special-characters-view__select">
        <notum-select [(value)]="selectedCategory" labelMode="activeOption">
          <button notumSelectOption value="all">All</button>
          <button notumSelectOption value="currency">Currency</button>
          <button notumSelectOption value="math">Math</button>
          <button notumSelectOption value="arrows">Arrows</button>
          <button notumSelectOption value="symbols">Symbols</button>
          <button notumSelectOption value="punctuation">Punctuation</button>
        </notum-select>
      </div>

      <!-- Characters Grid -->
      <div class="special-characters-view__grid-container">
        <div
          class="special-characters-view__grid"
          role="grid"
          aria-label="Special characters grid"
          tabindex="-1"
          (keydown)="onGridKeydown($event)"
        >
          <button
            *ngFor="let char of currentCharacters; let i = index"
            #charButton
            type="button"
            role="gridcell"
            class="special-characters-view__char-button"
            (click)="insertCharacter(char.char)"
            [attr.aria-label]="char.name + (char.code ? ' (' + char.code + ')' : '')"
            [title]="char.name + (char.code ? ' (' + char.code + ')' : '')"
            [attr.data-index]="i"
          >
            {{ char.char }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="special-characters-view__actions">
        <button type="button" notumButton variant="secondary" (click)="close?.()">Close</button>
      </div>
    </div>
  `,
  styleUrls: ['./special-characters-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialCharactersViewComponent implements BubbleMenuViewContent<Record<string, unknown>>, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  editor?: Editor;
  close?: () => void;
  goBack?: (viewId?: string) => void;
  navigateTo?: (viewId: string) => void;

  selectedCategory: (typeof CharacterCategory)[keyof typeof CharacterCategory] = 'all';

  @ViewChildren('charButton') charButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  readonly GRID_COLUMNS = 6;

  private rafId: number | null = null;
  private pendingKey: string | null = null;

  get currentCharacters(): SpecialCharacter[] {
    const category = this.selectedCategory;
    switch (category) {
      case 'all':
        return [
          ...this.currencyChars,
          ...this.mathChars,
          ...this.arrowChars,
          ...this.symbolChars,
          ...this.punctuationChars,
        ];
      case 'currency':
        return this.currencyChars;
      case 'math':
        return this.mathChars;
      case 'arrows':
        return this.arrowChars;
      case 'symbols':
        return this.symbolChars;
      case 'punctuation':
        return this.punctuationChars;
      default:
        return this.currencyChars;
    }
  }

  currencyChars: SpecialCharacter[] = CHARACTERS[CharacterCategory.CURRENCY];
  mathChars: SpecialCharacter[] = CHARACTERS[CharacterCategory.MATH];
  arrowChars: SpecialCharacter[] = CHARACTERS[CharacterCategory.ARROWS];
  symbolChars: SpecialCharacter[] = CHARACTERS[CharacterCategory.SYMBOLS];
  punctuationChars: SpecialCharacter[] = CHARACTERS[CharacterCategory.PUNCTUATION];

  onActivate(): void {
    // Reset to default category and trigger change detection
    this.selectedCategory = 'all';
    this.cdr.markForCheck();
  }

  insertCharacter(char: string): void {
    if (!this.editor) return;

    this.editor.chain().focus().insertContent(char).run();
    this.close?.();
  }

  onGridKeydown(event: KeyboardEvent): void {
    const validKeys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!validKeys.includes(event.key)) return;

    event.preventDefault();
    this.pendingKey = event.key;

    // Already scheduled, skip
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      if (this.pendingKey) {
        this.handleNavigation(this.pendingKey);
      }
      this.rafId = null;
      this.pendingKey = null;
    });
  }

  private handleNavigation(key: string): void {
    const buttons = this.charButtons.toArray();
    if (buttons.length === 0) return;

    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = buttons.findIndex((btn) => btn.nativeElement === activeElement);

    if (currentIndex === -1) return;

    let targetIndex = currentIndex;

    switch (key) {
      case 'ArrowRight':
        targetIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : currentIndex;
        break;
      case 'ArrowLeft':
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        break;
      case 'ArrowDown':
        targetIndex = currentIndex + this.GRID_COLUMNS;
        if (targetIndex >= buttons.length) {
          targetIndex = currentIndex;
        }
        break;
      case 'ArrowUp':
        targetIndex = currentIndex - this.GRID_COLUMNS;
        if (targetIndex < 0) {
          targetIndex = currentIndex;
        }
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = buttons.length - 1;
        break;
    }

    buttons[targetIndex]?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
