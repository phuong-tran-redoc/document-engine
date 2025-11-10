import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { DocumentEngineConfig } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';

/**
 * Character Count component for document editor footer
 * Displays character/word count with optional limit and color coding
 */
@Component({
  selector: 'document-engine-character-count',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-count.component.html',
  styleUrls: ['./character-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCountComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() editor!: Editor;
  @Input() config?: Partial<DocumentEngineConfig>;
  @Input() mode: 'characters' | 'words' = 'characters';

  count = 0;
  limit: number | null = null;

  private updateCount = (): void => {
    if (!this.editor) {
      return;
    }

    // Get count from editor storage if available
    const characterCountStorage = this.editor.storage.characterCount;
    if (characterCountStorage) {
      if (this.mode === 'characters') {
        this.count = characterCountStorage.characters?.() || 0;
      } else {
        this.count = characterCountStorage.words?.() || 0;
      }
    } else {
      // Fallback: calculate from text
      const text = this.editor.getText();
      if (this.mode === 'characters') {
        this.count = text.length;
      } else {
        this.count = text.trim() ? text.trim().split(/\s+/).length : 0;
      }
    }

    // Get limit from config
    const characterCountConfig = this.config?.characterCount;
    if (characterCountConfig && typeof characterCountConfig === 'object') {
      this.limit = characterCountConfig.limit || null;
    } else {
      this.limit = null;
    }

    this.cdr.markForCheck();
  };

  ngOnInit(): void {
    if (!this.editor) {
      return;
    }

    // Subscribe to update events to keep count in sync
    this.editor.on('update', this.updateCount);
    this.editor.on('transaction', this.updateCount);

    // Initialize count once
    this.updateCount();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.off('update', this.updateCount);
      this.editor.off('transaction', this.updateCount);
    }
  }

  isNearLimit(): boolean {
    if (!this.limit) {
      return false;
    }
    // Consider near limit when >= 90% of limit
    return this.count >= this.limit * 0.9 && this.count < this.limit;
  }

  isOverLimit(): boolean {
    if (!this.limit) {
      return false;
    }
    return this.count > this.limit;
  }
}

