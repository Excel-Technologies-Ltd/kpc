export interface InvoiceLine {
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
  /**	Dispatch : Link - Dispatch	*/
  dispatch: string;
  /**	Product : Link - Item	*/
  product?: string;
  /**	Quantity (KL) : Float	*/
  quantity_kl?: number;
  /**	Tariff : Link - Tariff	*/
  tariff: string;
  /**	Rate per KL : Currency	*/
  rate_per_kl?: number;
  /**	Amount : Currency	*/
  amount?: number;
}
