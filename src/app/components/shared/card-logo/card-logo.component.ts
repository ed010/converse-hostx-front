import { Component, Input } from '@angular/core';

/**
 * Renders the card scheme of a transaction as returned by the backend (cardLogo / cardTypeName, resolved
 * from the masked PAN's BIN against the admin-managed ranges). Shows the logo image when there is one,
 * the scheme name when the logo was not uploaded yet, and nothing for an unpaid transaction (no PAN).
 */
@Component({
  selector: 'app-card-logo',
  templateUrl: './card-logo.component.html',
  styleUrls: ['./card-logo.component.css'],
})
export class CardLogoComponent {
  @Input() logo: string | null | undefined;
  @Input() name: string | null | undefined;
  @Input() code: string | null | undefined;
  /** Text shown when the transaction has no card yet (not paid). */
  @Input() emptyText = '';
  /** Image height in pixels. */
  @Input() size = 32;

  imageFailed = false;

  get hasLogo(): boolean {
    return !!this.logo && !this.imageFailed;
  }

  get label(): string {
    return this.name || this.code || '';
  }
}
