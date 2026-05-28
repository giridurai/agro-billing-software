import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupeeToWords',
  standalone: true,
})
export class RupeeToWordsPipe implements PipeTransform {
  private ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  private tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || value === 0) {
      return 'Zero Rupees Only';
    }

    const num = Math.floor(value);
    if (num === 0) return 'Zero Rupees Only';

    return this.convertToWords(num) + ' Rupees Only';
  }

  private convertToWords(num: number): string {
    if (num < 20) {
      return this.ones[num];
    }

    if (num < 100) {
      return this.tens[Math.floor(num / 10)] + ' ' + this.ones[num % 10];
    }

    if (num < 1000) {
      return this.ones[Math.floor(num / 100)] + ' Hundred ' + this.convertToWords(num % 100);
    }

    if (num < 100000) {
      return (
        this.convertToWords(Math.floor(num / 1000)) + ' Thousand ' + this.convertToWords(num % 1000)
      );
    }

    if (num < 10000000) {
      return (
        this.convertToWords(Math.floor(num / 100000)) + ' Lakh ' + this.convertToWords(num % 100000)
      );
    }

    return (
      this.convertToWords(Math.floor(num / 10000000)) +
      ' Crore ' +
      this.convertToWords(num % 10000000)
    );
  }
}
