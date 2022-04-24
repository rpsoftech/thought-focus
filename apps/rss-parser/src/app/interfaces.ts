export interface torolinkReqHeaders {
  endsAfter: string;
  orderByField: 'endsOn';
  orderByDirection: 'ascending';
  status: 'Approved';
  take?: number;
  query?: any;
  skip: number;
}
