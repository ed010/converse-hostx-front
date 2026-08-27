import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  MerchantUser,
  MerchantUserWriteRequest,
  UpdateMerchantUserRequest,
  normalizeArmenianPhoneNumber,
} from "../models/merchantUser.model";

@Injectable({
  providedIn: "root",
})
export class MerchantUserService {
  constructor(private http: HttpClient) {}

  private toWriteBody(
    user: MerchantUser | any,
    merchants: MerchantUserWriteRequest["merchants"]
  ): MerchantUserWriteRequest {
    return {
      merchants,
      username: String(user?.username ?? ""),
      password: String(user?.password ?? ""),
      phoneNumber: normalizeArmenianPhoneNumber(user?.phoneNumber),
      canReverse: !!user?.canReverse,
      isGeneralUser: !!user?.isGeneralUser,
      canGenerateMultiQR: !!(
        user?.canGenerateMultiQR ?? user?.canGenerateMulti
      ),
      canRefund: !!user?.canRefund,
      canGenerateQR: !!(
        user?.canGenerateQR ??
        user?.canGenerateQr ??
        user?.showQr
      ),
    };
  }

  /**
   * Create user under a merchant. Body includes `merchants: [{ id, title }]` for that merchant.
   * `merchantId` query kept for APIs that still expect it.
   */
  addUser(merchantId: number, merchantTitle: string, user: MerchantUser) {
    const merchants: { id: number; title: string }[] = [
      { id: Number(merchantId), title: String(merchantTitle ?? "") },
    ];
    const body = this.toWriteBody(user, merchants);
    const params = new HttpParams().set("merchantId", String(merchantId));
    return this.http.post(`/api/v1/MerchantUsers/AddMerchantUser`, body, {
      params,
      observe: "response",
    });
  }

  getUsers() {
    return this.http.get(`/api/v1/MerchantUser/GetMerchantUsers`, {
      observe: "response",
    });
  }

  getUsersByPage(page, count) {
    return this.http.get(
      `/api/MerchantUser/GetMerchantUsersByPage?page=${page}&count=${count}`,
      {
        observe: "response",
      }
    );
  }

  getUsersByMerchant(id: number) {
    const params = new HttpParams().set("merchantId", id.toString());
    return this.http.get(`/api/v1/MerchantUsers/GetMerchantUsersByMerchant`, {
      params,
      observe: "response",
    });
  }

  deleteMerchantUser(id: number) {
    const params = new HttpParams().set("id", id.toString());
    return this.http.delete(`/api/MerchantUser/RemoveMerchantUser`, {
      params,
      observe: "response",
    });
  }

  disableMerchantUser(id: number | string) {
    const params = new HttpParams().set("merchantUserId", String(id));
    return this.http.put(
      `/api/v1/MerchantUsers/ChangeMerchantUserStatus`,
      null,
      { params, observe: "response" }
    );
  }

  getUsersByName(name: string) {
    const params = new HttpParams().set("q", name.toString());
    return this.http.get(`/api/MerchantUser/FindMerchantUsersByUsername`, {
      params,
      observe: "response",
    });
  }

  updateUser(user: MerchantUser | { merchantUserId?: string; id?: string }) {
    const u = user as any;
    const body: UpdateMerchantUserRequest = {
      ...this.toWriteBody(user, null),
      merchantUserId: String(u?.merchantUserId ?? u?.id ?? ""),
    };
    return this.http.put(`/api/v1/MerchantUsers/UpdateMerchantUser`, body, {
      observe: "response",
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(
      `/api/v1/MerchantUsers/ChangePassword`,
      {
        currentPassword,
        newPassword,
      },
      { observe: "response" }
    );
  }
}
