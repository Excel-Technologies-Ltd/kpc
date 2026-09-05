export interface Allocation {
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
  /**	Nomination : Link - Nomination	*/
  nomination: string;
  /**	Reconciliation : Link - Reconciliation	*/
  reconciliation: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Customer : Link - Customer	*/
  customer?: string;
  /**	Product : Link - Item	*/
  product?: string;
  /**	Allocated Quantity (KL) : Float	*/
  allocated_quantity_kl: number;
  /**	Allocation Basis : Select	*/
  allocation_basis?: 'Nomination Match' | 'Pro-Rata' | 'Manual Override';
  /**	Remarks : Small Text	*/
  remarks?: string;
}
