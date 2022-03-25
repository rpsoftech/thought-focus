/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from 'rxjs';

@Pipe({
  name: 'autoCloseNotificationPipe',
})
export class AutoCloseNotificationPipePipe implements PipeTransform {
  timeout!: any;
  transform(value: string, Obse: Subject<string>, timeout = 5000): string {
    if (value === '') {
      return '';
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      Obse.next('');
    }, timeout);
    return value;
  }
}
