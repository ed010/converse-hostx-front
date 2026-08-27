export class Domain{
  id:number;
  title:string;
}

export interface DomainListResponse {
  items: Domain[];
  totalCount: number;
}
