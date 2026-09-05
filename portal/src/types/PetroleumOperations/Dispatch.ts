export interface Dispatch {
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
  /**	Allocation : Link - Allocation	*/
  allocation: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Customer : Link - Customer	*/
  customer?: string;
  /**	Dispatching From Tank : Link - Oil Tank	*/
  destination_tank: string;
  /**	Dispatch Date/Time : Datetime	*/
  dispatch_datetime: string;
  /**	Dispatch Mode : Select	*/
  dispatch_mode: 'Truck' | 'Rail' | 'Ex-Pipeline';
  /**	Dispatched Quantity (KL) : Float	*/
  dispatched_quantity_kl: number;
  /**	Vehicle/Vessel Reference : Data - Truck plate, rail wagon number, etc.	*/
  vehicle_or_vessel_ref?: string;
  /**	Driver / Clearing Agent : Data	*/
  driver_or_agent?: string;
  /**	ArcApps Delivery Note : Link - Delivery Note - Created and submitted automatically on Dispatch submit; posts the actual Stock Ledger movement.	*/
  delivery_note?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
