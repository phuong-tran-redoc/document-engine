import { NgModule } from '@angular/core';
import { TiptapEditorDirective } from '../core';
import { DocumentEditorComponent } from './document-editor.component';

/**
 * Back-compat shim for NgModule-based consumers. `DocumentEditorComponent` is now
 * standalone (and `@defer`-friendly); standalone consumers should import it (and
 * `TiptapEditorDirective`) directly instead of this module.
 */
@NgModule({
  imports: [DocumentEditorComponent, TiptapEditorDirective],
  exports: [DocumentEditorComponent, TiptapEditorDirective],
})
export class DocumentEditorModule {}
