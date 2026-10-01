import { formatDate } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/** Armenia is UTC+4 all year (no daylight saving), so the offset is fixed. */
export const GMT4_OFFSET = '+0400';

/**
 * The API stores and returns UTC dates, mostly without a zone suffix ("2026-09-29T12:00:41.83").
 * A plain `| date` reads those as the browser's local time and so shows the UTC clock. This parses
 * them as UTC and always displays GMT+4, whatever timezone the viewer's machine is in.
 */
export function toGmt4(value: string | number | Date | null | undefined, format: string, locale: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  let input: string | number | Date = value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !/(Z|[+-]\d{2}:?\d{2})$/.test(value)) {
    input = value + 'Z';
  }
  return formatDate(input, format, locale, GMT4_OFFSET);
}

@Pipe({ name: 'gmt4' })
export class Gmt4DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: string | number | Date | null | undefined, format = 'dd/MM/yy HH:mm'): string | null {
    return toGmt4(value, format, this.locale);
  }
}
