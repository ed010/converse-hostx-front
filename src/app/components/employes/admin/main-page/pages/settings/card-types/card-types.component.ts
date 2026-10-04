import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardType, CardTypeRequest } from 'src/app/models/card-type.model';
import { CardTypeService } from 'src/app/services/card-type.service';

/**
 * Admin settings page for card schemes: upload the logo shown next to transactions and maintain the
 * BIN ranges the backend uses to recognise a masked PAN. The "unknown card" row is the fallback for
 * PANs that match no range; its logo is editable, its ranges and code are not.
 */
@Component({
  selector: 'app-card-types',
  templateUrl: './card-types.component.html',
  styleUrls: ['./card-types.component.scss'],
})
export class CardTypesComponent implements OnInit, OnDestroy {
  cardTypes: CardType[] = [];
  loading = false;

  /** Form state of the add / edit modal. */
  editing: CardType | null = null;
  form: CardTypeRequest = this.emptyForm();
  /** Preview of the chosen or stored logo. */
  logoPreview: string | null = null;
  /** New ranges typed while creating a card type (sent with the create request). */
  newRanges: { rangeStart: string; rangeEnd: string }[] = [];

  /** Range being added to an existing card type. */
  rangeTarget: CardType | null = null;
  rangeDraft = { rangeStart: '', rangeEnd: '' };

  deleteTarget: CardType | null = null;

  @ViewChild('closeEditModal') closeEditModal: ElementRef;
  @ViewChild('closeRangeModal') closeRangeModal: ElementRef;
  @ViewChild('closeDeleteModal') closeDeleteModal: ElementRef;

  constructor(private cardTypeService: CardTypeService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cardTypeService.getCardTypes().subscribe(
      (res) => {
        this.cardTypes = res ?? [];
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.showError(err);
      }
    );
  }

  // ---- add / edit card type -------------------------------------------------

  startAdd(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.form.sortOrder = this.nextSortOrder();
    this.logoPreview = null;
    this.newRanges = [];
  }

  startEdit(cardType: CardType): void {
    this.editing = cardType;
    this.form = {
      code: cardType.code,
      name: cardType.name,
      sortOrder: cardType.sortOrder,
      logo: cardType.logoUrl ?? undefined,
    };
    this.logoPreview = cardType.logoUrl;
    this.newRanges = [];
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this._snackBar.open('Please choose an image file.', '', { duration: 5000 });
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      // The backend accepts the data: URI as-is and derives the file extension from its MIME type.
      this.form.logoBase64 = dataUrl;
      this.logoPreview = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  addDraftRange(): void {
    this.newRanges.push({ rangeStart: '', rangeEnd: '' });
  }

  removeDraftRange(index: number): void {
    this.newRanges.splice(index, 1);
  }

  save(): void {
    const name = (this.form.name ?? '').trim();
    const code = (this.form.code ?? '').trim().toUpperCase();
    if (!this.editing && !code) {
      this._snackBar.open('Code is required.', '', { duration: 5000 });
      return;
    }
    if (!name) {
      this._snackBar.open('Name is required.', '', { duration: 5000 });
      return;
    }
    const request: CardTypeRequest = {
      code: this.editing?.isDefault ? undefined : code,
      name,
      sortOrder: Number(this.form.sortOrder) || 0,
      logoBase64: this.form.logoBase64,
      logo: this.form.logoBase64 ? undefined : this.form.logo,
    };

    if (this.editing) {
      this.cardTypeService.updateCardType(this.editing.id, request).subscribe(
        () => this.afterSave(this.closeEditModal),
        (err) => this.showError(err)
      );
      return;
    }

    const ranges = this.newRanges
      .map((r) => ({ rangeStart: r.rangeStart.trim(), rangeEnd: r.rangeEnd.trim() }))
      .filter((r) => r.rangeStart || r.rangeEnd);
    const invalid = ranges.find((r) => !this.isValidRange(r.rangeStart, r.rangeEnd));
    if (invalid) {
      this._snackBar.open('Each range needs a start and an end of 6 to 19 digits, same length, start <= end.', '', { duration: 7000 });
      return;
    }
    request.ranges = ranges;
    this.cardTypeService.addCardType(request).subscribe(
      () => this.afterSave(this.closeEditModal),
      (err) => this.showError(err)
    );
  }

  // ---- BIN ranges of an existing card type ---------------------------------

  startAddRange(cardType: CardType): void {
    this.rangeTarget = cardType;
    this.rangeDraft = { rangeStart: '', rangeEnd: '' };
  }

  saveRange(): void {
    if (!this.rangeTarget) {
      return;
    }
    const start = this.rangeDraft.rangeStart.trim();
    const end = this.rangeDraft.rangeEnd.trim();
    if (!this.isValidRange(start, end)) {
      this._snackBar.open('Start and end must be 6 to 19 digits of the same length, start <= end.', '', { duration: 7000 });
      return;
    }
    this.cardTypeService.addBinRange(this.rangeTarget.id, start, end).subscribe(
      () => this.afterSave(this.closeRangeModal),
      (err) => this.showError(err)
    );
  }

  deleteRange(rangeId: number): void {
    this.cardTypeService.deleteBinRange(rangeId).subscribe(
      () => this.load(),
      (err) => this.showError(err)
    );
  }

  // ---- delete card type ----------------------------------------------------

  confirmDelete(): void {
    if (!this.deleteTarget) {
      return;
    }
    this.cardTypeService.deleteCardType(this.deleteTarget.id).subscribe(
      () => this.afterSave(this.closeDeleteModal),
      (err) => this.showError(err)
    );
  }

  // ---- helpers -------------------------------------------------------------

  /** Mirrors the backend rule: digits only, 6..19 long, equal length, start <= end. */
  isValidRange(start: string, end: string): boolean {
    const digits = /^\d{6,19}$/;
    return digits.test(start) && digits.test(end) && start.length === end.length && start <= end;
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  private afterSave(closeButton: ElementRef): void {
    closeButton?.nativeElement?.click();
    this.load();
  }

  private nextSortOrder(): number {
    const orders = this.cardTypes.filter((c) => !c.isDefault).map((c) => c.sortOrder);
    return orders.length ? Math.max(...orders) + 1 : 1;
  }

  private emptyForm(): CardTypeRequest {
    return { code: '', name: '', sortOrder: 0 };
  }

  private showError(err: any): void {
    const message = err?.error?.message ?? err?.message ?? 'Request failed';
    this._snackBar.open(message, '', { duration: 7000 });
  }

  ngOnDestroy(): void {
    this.closeEditModal?.nativeElement?.click();
    this.closeRangeModal?.nativeElement?.click();
    this.closeDeleteModal?.nativeElement?.click();
  }
}
