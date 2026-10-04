import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardType, CardTypeRequest } from '../models/card-type.model';

/** Admin CRUD for card schemes (logo + BIN ranges), backed by /api/v1/CardType. */
@Injectable({
  providedIn: 'root',
})
export class CardTypeService {
  constructor(private http: HttpClient) {}

  getCardTypes() {
    return this.http.get<CardType[]>(`/api/v1/CardType/GetCardTypes`);
  }

  addCardType(request: CardTypeRequest) {
    return this.http.post<CardType>(`/api/v1/CardType/AddCardType`, request);
  }

  updateCardType(id: number, request: CardTypeRequest) {
    return this.http.put<CardType>(`/api/v1/CardType/UpdateCardType/${id}`, request);
  }

  deleteCardType(id: number) {
    return this.http.delete(`/api/v1/CardType/DeleteCardType/${id}`);
  }

  addBinRange(cardTypeId: number, rangeStart: string, rangeEnd: string) {
    return this.http.post<CardType>(`/api/v1/CardType/AddBinRange/${cardTypeId}`, { rangeStart, rangeEnd });
  }

  updateBinRange(rangeId: number, rangeStart: string, rangeEnd: string) {
    return this.http.put<CardType>(`/api/v1/CardType/UpdateBinRange/${rangeId}`, { rangeStart, rangeEnd });
  }

  deleteBinRange(rangeId: number) {
    return this.http.delete<CardType>(`/api/v1/CardType/DeleteBinRange/${rangeId}`);
  }
}
