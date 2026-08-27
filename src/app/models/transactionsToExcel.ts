import { Transactions } from "./transactions.model";

export class TransactionsToExcel {
  keys: Map<string, Object>;
  transactions: Transactions[];
  constructor(){
    this.keys = new Map
    this.transactions = []
  }
}

