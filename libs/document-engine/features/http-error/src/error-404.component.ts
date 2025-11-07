import { Component } from '@angular/core';

@Component({
  selector: 'document-engine-error-404',
  standalone: true,
  template: `
    <div class="flex h-screen items-center justify-center">
      <h1 class="text-9xl font-bold text-gray-600">404</h1>
    </div>
  `,
})
export class Error404Component {}
