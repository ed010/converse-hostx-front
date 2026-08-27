import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencySymbol' })
export class CurrencySymbolPipe implements PipeTransform {
  transform(code: string | null | undefined): string {
    // Handle null or undefined
    if (!code) {
      return '';
    }

    // If the code is purely numeric (like "051", "123"), return empty string
    if (/^\d+$/.test(code)) {
      return '';
    }

    switch (code) {
      case 'AMD': return '֏';
      case 'USD': return '$';
      case 'RUB': return '₽';
      case 'EUR': return '€';
      default: return code; // Now safe: non-null, non-numeric
    }
  }
}