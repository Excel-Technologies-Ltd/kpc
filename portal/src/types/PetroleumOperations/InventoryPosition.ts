export interface InventoryPosition {
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
  /**	Tank : Link - Oil Tank	*/
  tank: string;
  /**	Stock Owner : Link - Customer - Party who owns the stock in custody. Leave blank for KPC-owned stock.	*/
  stock_owner?: string;
  /**	Position Date : Date	*/
  position_date: string;
  /**	Opening Volume (KL) : Float	*/
  opening_volume_kl: number;
  /**	Receipts (KL) : Float	*/
  receipts_kl?: number;
  /**	Dispatches (KL) : Float	*/
  dispatches_kl?: number;
  /**	Adjustments (KL) : Float - Gains(+)/Losses(-) not attributable to a receipt or dispatch.	*/
  adjustments_kl?: number;
  /**	Closing Volume (KL) : Float	*/
  closing_volume_kl?: number;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
