import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ROUTE } from '@document-engine/util';

@Component({
  selector: 'document-engine-home-page',
  standalone: true,
  imports: [RouterModule, MatButtonModule],
  template: `
    <div class="px-4 py-6 max-w-5xl mx-auto">
      <div class="space-y-6">
        <h1 class="text-xl font-bold mb-6">Welcome to the Document Engine Demo</h1>

        <p class="leading-relaxed">
          What you're seeing is not just a text editor. It is a <strong>live demo</strong> of a proprietary library
          system that I personally designed and developed.
        </p>

        <p class="leading-relaxed">
          This demo is a Proof of Concept (PoC) for an in-house <strong>Document Engine</strong>, designed to solve
          real-world enterprise problems.
        </p>

        <section class="mt-8">
          <h2 class="text-lg font-semibold mb-4">1. The Problem</h2>
          <p class="mb-4 leading-relaxed">
            In many enterprises, especially in Banking/Finance, generating critical documents (like a "Letter of Offer")
            often relies on third-party rich-text editors (like CKEditor). This dependency creates several significant
            problems:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li><strong>Licensing Costs:</strong> Significant recurring annual fees.</li>
            <li>
              <strong>Lack of Flexibility:</strong> Being constrained by the vendor's feature set, making deep
              business-logic customizations difficult.
            </li>
            <li>
              <strong>Technology Risk:</strong> Reliance on a "black-box" technology introduces strategic risk and
              complicates deep integrations.
            </li>
          </ul>
        </section>

        <section class="mt-8">
          <h2 class="text-lg font-semibold mb-4">2. The Solution</h2>
          <p class="mb-4 leading-relaxed">
            This <strong>Document Engine</strong> was built to solve all of these issues:
          </p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Business-Focused:</strong> Built with core business features in mind, such as
              <strong>"Dynamic Fields"</strong> (<code class="bg-muted px-1 rounded"
                >{{ '{' }}{{ '{' }}customer_name{{ '}' }}{{ '}' }}</code
              >, <code class="bg-muted px-1 rounded">{{ '{' }}{{ '{' }}loan_amount{{ '}' }}{{ '}' }}</code
              >).
            </li>
            <li>
              <strong>Technological Autonomy:</strong> Develops a proprietary Intellectual Property (IP) asset, allowing
              full control over the product roadmap.
            </li>
            <li><strong>Reduced TCO:</strong> Completely eliminates third-party licensing costs.</li>
          </ul>
        </section>

        <section class="mt-8">
          <h2 class="text-lg font-semibold mb-4">3. Technical Deep-Dive</h2>
          <p class="mb-4 leading-relaxed">Here is the technical architecture behind this demo:</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Core Technology:</strong> Built on the
              <strong
                ><a
                  href="https://tiptap.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-theme-blue hover:underline"
                  >Tiptap</a
                ></strong
              >
              (a headless editor framework) foundation, which is built on top of
              <strong
                ><a
                  href="https://prosemirror.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-theme-blue hover:underline"
                  >ProseMirror</a
                ></strong
              >. The entire engine is written in <strong>TypeScript</strong>.
            </li>
            <li>
              <strong>Decoupled, Multi-package Architecture:</strong> The system is split into two separate NPM
              packages:
              <ul class="list-disc list-inside space-y-1 ml-6 mt-2">
                <li>
                  <strong><code class="bg-muted px-1 rounded">document-engine-core</code></strong
                  >: A 100% <strong>framework-agnostic</strong> library containing all business logic and custom
                  extensions.
                </li>
                <li>
                  <strong><code class="bg-muted px-1 rounded">document-engine-angular</code></strong
                  >: An <strong>Angular wrapper</strong> library providing components (<code
                    class="bg-muted px-1 rounded"
                    >&lt;document-editor&gt;</code
                  >) to integrate the core engine.
                </li>
              </ul>
            </li>
            <li>
              <strong>Reusability:</strong> This architecture ensures the core logic can be reused across
              <em>any</em> future framework (React, Vue, etc.).
            </li>
          </ul>
        </section>

        <div class="mt-8 pt-6 border-t border-border">
          <p class="mb-2">
            <strong>Feel free to try it!</strong> You can use the editor above to experience all the features.
          </p>
          <p>
            <strong>About Developer:</strong> I'm <strong>Duc Phuong (Jack)</strong>, the architect behind this project.
            To learn more about my background, please visit my
            <a [routerLink]="['/', route.CONTACT]" class="text-theme-blue hover:underline"
              ><strong>About page</strong></a
            >.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class HomePageComponent {
  readonly route = ROUTE;
}
