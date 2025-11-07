import { Pipe, PipeTransform } from '@angular/core';
import { ToastType } from './toast.type';

@Pipe({
  name: 'toastIcon',
  standalone: true,
})
export class ToastIconPipe implements PipeTransform {
  transform(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}
