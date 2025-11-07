import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { DocumentEngineLayoutComponent } from '@document-engine/layout';

const components = [
  // Angular
  RouterModule,

  // Layout
  DocumentEngineLayoutComponent,

  // Material
  MatSlideToggleModule,
  MatMenuModule,
  MatButtonModule,
];

@Component({
  imports: components,
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected title = 'document-engine';
}
