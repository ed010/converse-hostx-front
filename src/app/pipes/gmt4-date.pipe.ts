import { formatDate } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

/**
 * The API sends every date already on the Armenia (GMT+4) clock, without a zone suffix
 * ("2026-09-29T16:00:41"). This prints that clock exactly as received: no timezone conversion,
 * so the viewer's machine timezone never changes what is shown. A plain `| date` must not be
 * used for API dates, because it shifts values that carry a zone to the browser's timezone.
 */
export function toGmt4(value: string | number | Date | null | undefined, format: string, locale: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parts = typeof value === 'string' ? WALL_CLOCK.exec(value) : null;
  if (!parts) {
    return formatDate(value, format, locale);
  }
  // Hold the received clock in a UTC date and format it as UTC, so it comes out unchanged.
  const asReceived = new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5], +(parts[6] || 0)));
  return formatDate(asReceived, format, locale, '+0000');
}

const pad2 = (n: number): string => (n < 10 ? '0' + n : '' + n);

const dayPart = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/**
 * Start of the picked calendar day for a filter: 2026-06-21 → "2026-06-21T00:00:00".
 * No zone is sent; the API reads zone-less dates on the Armenia (GMT+4) clock.
 */
export function gmt4DayStart(date: Date): string {
  return `${dayPart(date)}T00:00:00`;
}

/** End of the picked calendar day for a filter: 2026-06-21 → "2026-06-21T23:59:59". */
export function gmt4DayEnd(date: Date): string {
  return `${dayPart(date)}T23:59:59`;
}

/** The calendar day of a filter value produced by gmt4DayStart / gmt4DayEnd, for the date picker. */
export function parseFilterDay(value: string): Date | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return parts ? new Date(+parts[1], +parts[2] - 1, +parts[3]) : null;
}

@Pipe({ name: 'gmt4' })
export class Gmt4DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: string | number | Date | null | undefined, format = 'dd/MM/yy HH:mm'): string | null {
    return toGmt4(value, format, this.locale);
  }
}
