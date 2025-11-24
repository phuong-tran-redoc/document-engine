import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentEditorComponent } from './document-editor.component';
import { ToolbarComponent } from '../ui/toolbar/toolbar.component';
import { FooterComponent } from '../ui/footer/footer.component';

@NgModule({
  declarations: [DocumentEditorComponent],
  imports: [CommonModule, ToolbarComponent, FooterComponent],
  exports: [DocumentEditorComponent],
})
export class DocumentEditorModule {}
