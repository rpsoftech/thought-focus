import { Pipe, PipeTransform } from '@angular/core';
import { Subject } from 'rxjs';

@Pipe({
  name: 'autoCloseNotificationPipe',
})
export class AutoCloseNotificationPipePipe implements PipeTransform {
  timeout!: any;
  transform(value: string, Obse: Subject<string>): string {
    if (value === '') {
      return '';
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      Obse.next('');
    }, 5000);
    return value;
  }
}
