import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionValueAccessor } from '@shared/ui/confirmation-dialog';

@Component({
  selector: 'document-engine-reason-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label for="reason" class="block text-muted-foreground mb-1">Reason (optional)</label>
    <textarea
      id="reason"
      [(ngModel)]="value"
      rows="4"
      placeholder="Type your reason here..."
      class="w-full rounded-md border border-input bg-background text-foreground p-3 outline-none focus:ring-2 ring-ring"
    ></textarea>
  `,
})
export class DocumentEngineReasonTextareaComponent implements ActionValueAccessor<string> {
  value = '';

  getValue(): string {
    return this.value;
  }
}
