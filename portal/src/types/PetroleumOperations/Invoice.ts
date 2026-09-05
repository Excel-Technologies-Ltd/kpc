import { InvoiceLine } from './InvoiceLine';

export interface Invoice {
  name: string;
  creation: string;
  modified: string;
  owner: string;
  modified_by: string;
  docstatus: 0 | 1 | 2;
  parent?: string;
  parentfield?: string;
  parenttype?: string;
  idx?: number;
  /**	Journey Reference : Link - Journey	*/
  journey_ref: string;
  /**	Customer : Link - Customer	*/
  customer: string;
  /**	Company : Link - Company	*/
  company: string;
  /**	Currency : Link - Currency	*/
  currency: string;
  /**	Posting Date : Date	*/
  posting_date: string;
  /**	Lines : Table - Invoice Line	*/
  lines: InvoiceLine[];
  /**	Grand Total : Currency	*/
  grand_total?: number;
  /**	ArcApps Sales Invoice : Link - Sales Invoice - Created and submitted automatically on Invoice submit; carries this Golden Thread through to the GL.	*/
  sales_invoice?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
