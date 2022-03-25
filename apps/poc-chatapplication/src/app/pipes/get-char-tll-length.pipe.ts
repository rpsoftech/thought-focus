import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getCharTllLength',
})
export class GetCharTllLengthPipe implements PipeTransform {
  transform(value: string, len = 1): string {
    return value.toString().slice(0, len).toUpperCase();
  }
}
