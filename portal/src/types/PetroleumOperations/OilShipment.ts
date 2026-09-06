export interface OilShipment {
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
  /**	Journey Reference : Link - Journey - Golden Thread ID. Auto-created on first save of this Shipment.	*/
  journey_ref?: string;
  /**	Status : Select	*/
  workflow_state?: 'Draft' | 'Vessel Arrived' | 'Discharging' | 'Received' | 'Cancelled';
  /**	Vessel Name : Data	*/
  vessel_name: string;
  /**	Vessel IMO Number : Data	*/
  vessel_imo_number?: string;
  /**	Bill of Lading No : Data	*/
  bill_of_lading_no?: string;
  /**	Supplier : Link - Supplier	*/
  supplier?: string;
  /**	Product : Link - Item	*/
  product: string;
  /**	Receiving Terminal : Link - Terminal	*/
  terminal: string;
  /**	Planned Quantity (KL) : Float	*/
  planned_quantity_kl: number;
  /**	Planned Quantity (MT) : Float	*/
  planned_quantity_mt?: number;
  /**	ETA (Estimated Time of Arrival) : Datetime	*/
  eta?: string;
  /**	ATA (Actual Time of Arrival) : Datetime	*/
  ata?: string;
  /**	Discharge Start : Datetime	*/
  discharge_start?: string;
  /**	Discharge End : Datetime	*/
  discharge_end?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
