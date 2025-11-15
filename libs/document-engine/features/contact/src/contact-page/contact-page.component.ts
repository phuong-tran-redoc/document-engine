import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTE } from '@document-engine/util';

@Component({
  selector: 'document-engine-contact-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="px-4 py-6 max-w-5xl mx-auto">
      <div class="space-y-6">
        <h1 class="text-xl font-bold mb-6">About</h1>

        <p>Hi, I'm <strong>Duc Phuong (Jack)</strong>.</p>

        <p>
          I am a Senior Frontend Engineer specializing in building complex, high-performance, and scalable web
          applications.
        </p>

        <p class="mb-4">You can find me here:</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>LinkedIn:</strong>
            <a
              href="https://www.linkedin.com/in/tdp1999/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-theme-blue hover:underline ml-1"
              >https://www.linkedin.com/in/tdp1999/</a
            >
          </li>
          <li>
            <strong>GitHub:</strong>
            <a
              href="https://github.com/tdp1999"
              target="_blank"
              rel="noopener noreferrer"
              class="text-theme-blue hover:underline ml-1"
              >https://github.com/tdp1999</a
            >
          </li>
          <li>
            <strong>Email:</strong>
            <a href="mailto:tdp99.business@gmail.com" class="text-theme-blue hover:underline ml-1"
              >tdp99.business@gmail.com</a
            >
          </li>
        </ul>
        <div class="mt-8 pt-6 border-t border-border">
          <a [routerLink]="['/', route.HOME]" class="text-theme-blue hover:underline">← Back to the Demo</a>
        </div>
      </div>
    </div>
  `,
})
export class ContactPageComponent {
  readonly route = ROUTE;
}
