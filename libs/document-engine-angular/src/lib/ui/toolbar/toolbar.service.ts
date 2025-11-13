import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to handle toolbar action emissions
 */
@Injectable({ providedIn: 'root' })
export class ToolbarService implements OnDestroy {
  // Subject để emit toolbar actions
  private readonly actionSubject = new Subject<{ actionName: string; value?: unknown }>();
  readonly action$ = this.actionSubject.asObservable();

  // EventEmitter for template binding
  readonly action = new EventEmitter<string>();

  /**
   * Emit an action
   */
  emit(actionName: string, value?: unknown): void {
    this.actionSubject.next({ actionName, value });
    this.action.emit(actionName);
  }

  ngOnDestroy(): void {
    this.actionSubject.complete();
  }
}
