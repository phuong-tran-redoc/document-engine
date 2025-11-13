import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DocumentEngineConfig } from '../../core/kit/kit.type';
import { Editor } from '@tiptap/core';
import { CharacterCountComponent } from '../character-count/character-count.component';

/**
 * Footer component for document editor
 * Container for footer components like character count
 */
@Component({
  selector: 'document-engine-footer',
  standalone: true,
  imports: [CommonModule, CharacterCountComponent],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Input() editor!: Editor;
  @Input() config?: Partial<DocumentEngineConfig>;
  // @Input() editable = true;

  hasCharacterCount(): boolean {
    const config = this.config ?? {};
    return config.characterCount !== false;
  }
}
