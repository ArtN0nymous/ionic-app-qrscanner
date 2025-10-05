import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(array: any[], text: string = '', column: string = ''): any[] {
    if (text === '') {
      return array;
    }
    if (!array) {
      return array;
    }
    text = text.toLowerCase();
    return array.filter(item => item[column].toLowerCase().includes(text));
  }
}
