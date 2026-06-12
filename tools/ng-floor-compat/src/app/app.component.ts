import { Component } from '@angular/core';
import { DocumentEngineConfig, MediaResult } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Touches the public surface that matters for compat: the editor component, the
 * config type, and the DE-005 `image.onPick` hook returning a `MediaResult`. AOT
 * compiling this template links the lib's (Angular-20-built, partial-format)
 * component declarations through the floor Angular's linker + template type-checker
 * — which is exactly what proves the package is installable on the declared peer floor.
 */
@Component({
  selector: 'app-root',
  template: `<document-engine-editor [config]="config"></document-engine-editor>`,
})
export class AppComponent {
  config: Partial<DocumentEngineConfig> = {
    bold: true,
    italic: true,
    heading: true,
    imageRef: true,
    image: { onPick: () => this.pick() },
  };

  private pick(): Promise<MediaResult | null> {
    return Promise.resolve({ id: 'media_demo', url: 'https://example.com/x.jpg', alt: 'demo' });
  }
}
