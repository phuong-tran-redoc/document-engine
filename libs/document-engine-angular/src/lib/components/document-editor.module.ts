import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TiptapEditorDirective } from '../core';
import { FooterComponent } from '../ui/footer/footer.component';
import { ToolbarComponent } from '../ui/toolbar/toolbar.component';
import { DocumentEditorComponent } from './document-editor.component';

@NgModule({
  declarations: [DocumentEditorComponent],
  imports: [CommonModule, ToolbarComponent, FooterComponent, TiptapEditorDirective],
  exports: [DocumentEditorComponent, TiptapEditorDirective],
})
export class DocumentEditorModule {}
