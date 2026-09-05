export interface Tariff {
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
  /**	Product : Link - Item	*/
  product: string;
  /**	Origin Terminal : Link - Terminal	*/
  origin_terminal: string;
  /**	Destination Terminal : Link - Terminal	*/
  destination_terminal: string;
  /**	Rate per KL : Currency	*/
  rate_per_kl: number;
  /**	Currency : Link - Currency	*/
  currency: string;
  /**	Effective From : Date	*/
  effective_from: string;
  /**	Effective To : Date	*/
  effective_to?: string;
  /**	Is Active : Check	*/
  is_active?: 0 | 1;
}
