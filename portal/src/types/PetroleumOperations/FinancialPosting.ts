export interface FinancialPosting {
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
  /**	Invoice : Link - Invoice	*/
  invoice: string;
  /**	ArcApps Sales Invoice : Link - Sales Invoice	*/
  sales_invoice: string;
  /**	Status : Select	*/
  status?: 'Posted' | 'Reversed';
  /**	Posting Date : Date	*/
  posting_date?: string;
  /**	Total Amount : Currency	*/
  total_amount?: number;
  /**	Currency : Link - Currency	*/
  currency?: string;
  /**	GL Entry Count : Int - Number of GL Entry rows posted for this Sales Invoice, stamped with this journey_ref.	*/
  gl_entry_count?: number;
}
