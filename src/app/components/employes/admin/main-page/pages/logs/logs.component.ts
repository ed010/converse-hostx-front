import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ArcaLog,
  HostxLog,
  LogsFilter,
  LogTrace,
} from "src/app/models/logs.model";
import { LogsService } from "src/app/services/logs.service";

type LogsTab = "arca" | "hostx" | "transaction";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.scss"],
})
export class LogsComponent implements OnInit {
  @ViewChild("detailModalOpen") detailModalOpen: ElementRef;
  @ViewChild("traceModalOpen") traceModalOpen: ElementRef;

  activeTab: LogsTab = "arca";
  showLoader = false;

  arcaItems: ArcaLog[] = [];
  hostxItems: HostxLog[] = [];
  transactionTraces: LogTrace[] = [];

  page = 1;
  pageSize = 50;
  totalCount = 0;
  totalPages = 0;

  filter: LogsFilter = {
    merchantId: "",
    transactionId: "",
    pxNumber: "",
    orderNumber: "",
    arcaOrderId: "",
    apiType: "",
    action: "",
    path: "",
    correlationId: "",
    from: "",
    to: "",
    isSuccess: "",
    statusCode: "",
    search: "",
  };

  historyLookup = {
    transactionId: "",
    pxNumber: "",
  };

  selectedArca: ArcaLog = null;
  selectedHostx: HostxLog = null;
  selectedTrace: LogTrace = null;
  detailType: "arca" | "hostx" = "arca";

  constructor(
    private logsService: LogsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setTab(tab: LogsTab): void {
    if (this.activeTab === tab) {
      return;
    }
    this.activeTab = tab;
    this.page = 1;
    if (tab !== "transaction") {
      this.load();
    }
  }

  load(): void {
    if (this.activeTab === "transaction") {
      return;
    }
    this.showLoader = true;
    const params = this.buildFilter();

    if (this.activeTab === "arca") {
      this.logsService.getArcaLogs(params).subscribe(
        (res) => {
          this.arcaItems = res.items || [];
          this.applyPageMeta(res);
          this.showLoader = false;
        },
        (err) => this.handleError(err)
      );
      return;
    }

    this.logsService.getHostxLogs(params).subscribe(
      (res) => {
        this.hostxItems = res.items || [];
        this.applyPageMeta(res);
        this.showLoader = false;
      },
      (err) => this.handleError(err)
    );
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.filter = {
      merchantId: "",
      transactionId: "",
      pxNumber: "",
      orderNumber: "",
      arcaOrderId: "",
      apiType: "",
      action: "",
      path: "",
      correlationId: "",
      from: "",
      to: "",
      isSuccess: "",
      statusCode: "",
      search: "",
    };
    this.page = 1;
    this.load();
  }

  goToPage(delta: number): void {
    const next = this.page + delta;
    if (next < 1 || (this.totalPages > 0 && next > this.totalPages)) {
      return;
    }
    this.page = next;
    this.load();
  }

  openArcaDetail(row: ArcaLog): void {
    this.detailType = "arca";
    this.selectedArca = row;
    this.selectedHostx = null;
    this.openDetailModal();
  }

  openHostxDetail(row: HostxLog): void {
    this.detailType = "hostx";
    this.selectedHostx = row;
    this.selectedArca = null;
    this.openDetailModal();
  }

  showTrace(correlationId: string, closeDetail = false): void {
    if (!correlationId) {
      return;
    }
    this.showLoader = true;
    this.logsService.getTrace(correlationId).subscribe(
      (res) => {
        this.selectedTrace = res;
        this.showLoader = false;
        if (closeDetail) {
          const detailEl = document.getElementById("logDetailModal");
          if (detailEl) {
            const dismissBtn = detailEl.querySelector(
              '[data-bs-dismiss="modal"]'
            ) as HTMLElement;
            if (dismissBtn) {
              dismissBtn.click();
            }
          }
          setTimeout(() => this.openTraceModal(), 300);
        } else {
          this.openTraceModal();
        }
      },
      (err) => this.handleError(err)
    );
  }

  loadTransactionHistory(): void {
    if (!this.historyLookup.transactionId && !this.historyLookup.pxNumber) {
      this.snackBar.open("Enter transactionId or pxNumber", "", {
        duration: 5000,
      });
      return;
    }
    this.showLoader = true;
    this.logsService
      .getTransactionHistory({
        transactionId: this.historyLookup.transactionId || undefined,
        pxNumber: this.historyLookup.pxNumber || undefined,
      })
      .subscribe(
        (res) => {
          this.transactionTraces = res || [];
          this.showLoader = false;
          if (!this.transactionTraces.length) {
            this.snackBar.open("No traces found", "", { duration: 5000 });
          }
        },
        (err) => this.handleError(err)
      );
  }

  pretty(value: string | null | undefined): string {
    if (value == null || value === "") {
      return "—";
    }
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  formatUtc(value: string): string {
    if (!value) {
      return "";
    }
    const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(value);
    return hasZone ? value : value + "Z";
  }

  private buildFilter(): LogsFilter {
    const params: LogsFilter = {
      page: this.page,
      pageSize: this.pageSize,
    };

    Object.keys(this.filter).forEach((key) => {
      let value = (this.filter as any)[key];
      if (value === null || value === undefined || value === "") {
        return;
      }
      if ((key === "from" || key === "to") && typeof value === "string") {
        const asDate = new Date(value);
        if (!isNaN(asDate.getTime())) {
          value = asDate.toISOString();
        }
      }
      (params as any)[key] = value;
    });

    return params;
  }

  private applyPageMeta(res: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }): void {
    this.totalCount = res.totalCount || 0;
    this.page = res.page || this.page;
    this.pageSize = res.pageSize || this.pageSize;
    this.totalPages = res.totalPages || 0;
  }

  private openDetailModal(): void {
    setTimeout(() => {
      if (this.detailModalOpen?.nativeElement) {
        this.detailModalOpen.nativeElement.click();
      }
    });
  }

  private openTraceModal(): void {
    setTimeout(() => {
      if (this.traceModalOpen?.nativeElement) {
        this.traceModalOpen.nativeElement.click();
      }
    });
  }

  private handleError(err: any): void {
    this.showLoader = false;
    const message =
      err?.error?.errorMessage ||
      err?.error?.message ||
      err?.message ||
      "Request failed";
    this.snackBar.open(message, "", { duration: 7000 });
  }
}
