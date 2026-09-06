export interface Nomination {
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
  /**	Journey Reference : Link - Journey - The received, quality-released parcel this demand is nominated against.	*/
  journey_ref: string;
  /**	Product : Link - Item	*/
  product?: string;
  /**	Customer : Link - Customer	*/
  customer: string;
  /**	Company : Link - Company - Used to evaluate the customer's credit limit for this order.	*/
  company: string;
  /**	Origin Terminal : Link - Terminal	*/
  origin_terminal: string;
  /**	Destination Terminal : Link - Terminal	*/
  destination_terminal: string;
  /**	Nominated Quantity (KL) : Float	*/
  nominated_quantity_kl: number;
  /**	Requested Delivery Date : Date	*/
  requested_delivery_date?: string;
  /**	Credit Status : Select	*/
  credit_status?: 'Not Checked' | 'Within Limit' | 'Exceeds Limit';
  /**	Stock Ownership Status : Select	*/
  ownership_status?: 'Not Checked' | 'Confirmed' | 'Insufficient Stock';
  /**	Remarks : Small Text	*/
  remarks?: string;
}
