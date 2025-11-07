import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import { IconComponent } from '../icon';
import { SelectLabelDirective } from './select-label.directive';
import { SelectOptionDirective } from './select-option.directive';
import { Subject, takeUntil } from 'rxjs';

/**
 * Select component with floating dropdown using @floating-ui/dom
 *
 * Usage:
 * <document-engine-select [(value)]="selectedValue" placeholder="Select...">
 *   <button documentEngineSelectOption value="option1">Option 1</button>
 *   <button documentEngineSelectOption value="option2">Option 2</button>
 * </document-engine-select>
 */
@Component({
  selector: 'document-engine-select',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements AfterContentInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() value: string | null = null;
  @Input() disabled = false;
  @Input() labelMode: 'static' | 'activeOption' = 'activeOption';
  @Input() variant: 'default' | 'outline' = 'default';

  @Output() valueChange = new EventEmitter<string | null>();

  @ViewChild('trigger', { static: false, read: ElementRef }) triggerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdown', { static: false, read: ElementRef }) dropdownRef!: ElementRef<HTMLElement>;

  @ContentChildren(SelectLabelDirective, { descendants: true }) labelDirectives!: QueryList<SelectLabelDirective>;
  @ContentChildren(SelectOptionDirective, { descendants: true }) options!: QueryList<SelectOptionDirective>;

  isOpen = false;
  selectedLabel: string | null = null;

  private cleanupAutoUpdate?: () => void;
  private documentClickListener?: () => void;
  private destroy = new Subject<void>();
  private contentInitialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value'] || !this.contentInitialized) return;

    this.updateSelectedLabel();
  }

  ngAfterContentInit(): void {
    // ContentChildren (options) are now available
    this.contentInitialized = true;

    // Initial update for any pre-set value
    this.updateSelectedLabel();

    // Listen to option changes (e.g., when options are dynamically added/removed)
    this.options.changes.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.updateSelectedLabel();
    });
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.removeDocumentClickListener();
    this.destroy.next();
    this.destroy.complete();
  }

  toggle(): void {
    if (this.disabled) return;

    if (this.isOpen) {
      this.close();
      return;
    }

    this.open();
  }

  open(): void {
    if (this.disabled || this.isOpen) return;

    this.isOpen = true;
    this.cdr.markForCheck();

    // Wait for dropdown to render
    setTimeout(() => {
      this.setupFloating();
      this.addDocumentClickListener();
    });
  }

  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.cleanup();
    this.removeDocumentClickListener();
    this.cdr.markForCheck();
  }

  selectOption(option: SelectOptionDirective): void {
    if (option.disabled) {
      return;
    }

    this.value = option.value;
    this.selectedLabel = option.getLabel();
    this.valueChange.emit(this.value);
    this.close();
    this.cdr.markForCheck();
  }

  private setupFloating(): void {
    if (!this.triggerRef || !this.dropdownRef) return;

    const triggerEl = this.triggerRef.nativeElement;
    const dropdownEl = this.dropdownRef.nativeElement;

    // Use autoUpdate to automatically reposition on scroll/resize
    this.cleanupAutoUpdate = autoUpdate(triggerEl, dropdownEl, () => {
      computePosition(triggerEl, dropdownEl, {
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        Object.assign(dropdownEl.style, { left: `${x}px`, top: `${y}px` });
      });
    });
  }

  private cleanup(): void {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
  }

  private addDocumentClickListener(): void {
    this.documentClickListener = () => this.close();

    // Use timeout to avoid immediate close from the same click that opened
    setTimeout(() => {
      if (this.documentClickListener) {
        document.addEventListener('click', this.documentClickListener);
      }
    });
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    // Stop propagation to prevent document click listener from closing
    event.stopPropagation();
  }

  /**
   * Check if should use static label (directive)
   * Falls back to activeOption if static mode but no label directive provided
   */
  get useStaticLabel(): boolean {
    return this.labelMode === 'static' && this.hasLabelDirective;
  }

  /**
   * Check if label directive exists
   */
  get hasLabelDirective(): boolean {
    return this.labelDirectives?.length > 0;
  }

  private updateSelectedLabel(): void {
    if (!this.options || this.labelMode === 'static') return;

    const selected = this.options.find((opt) => opt.value === this.value);
    this.selectedLabel = selected?.getLabel() || null;
    this.cdr.markForCheck();
  }
}
