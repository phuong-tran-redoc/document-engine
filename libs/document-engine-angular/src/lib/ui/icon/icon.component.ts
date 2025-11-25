import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { IconRegistryService } from './icon-registry.service';

@Component({
  selector: 'document-engine-icon',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class IconComponent {
  @Input()
  set name(value: string) {
    const svgContent = this.iconRegistry.getIconString(value);
    const hostElement = this.elementRef.nativeElement;

    // Set innerHTML to render SVG
    hostElement.innerHTML = svgContent;
    // this.cdr.markForCheck();
  }

  // private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);
  private iconRegistry = inject(IconRegistryService);

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['name']) {
  //     const svgContent = this.iconRegistry.getIconString(this.name);
  //     const hostElement = this.elementRef.nativeElement;

  //     // Set innerHTML to render SVG
  //     hostElement.innerHTML = svgContent;
  //     this.cdr.markForCheck();
  //   }
  // }
}
