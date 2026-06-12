import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DocumentEditorModule } from '@phuong-tran-redoc/document-engine-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DocumentEditorModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
