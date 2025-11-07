import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'document-engine-home-page',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  template: ` <div class="px-4 py-6 max-w-5xl mx-auto">Home Page</div> `,
})
export class HomePageComponent {}
