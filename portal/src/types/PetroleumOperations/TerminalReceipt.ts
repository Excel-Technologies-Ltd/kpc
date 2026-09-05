export interface TerminalReceipt {
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
  /**	Movement : Link - Movement	*/
  movement: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Destination Tank : Link - Oil Tank	*/
  destination_tank: string;
  /**	Receipt Date/Time : Datetime	*/
  receipt_datetime: string;
  /**	Observed Level (mm) : Float	*/
  observed_level_mm: number;
  /**	Observed Temperature (C) : Float	*/
  observed_temperature_c: number;
  /**	Free Water Dip (mm) : Float	*/
  water_dip_mm?: number;
  /**	Density at 15C (kg/L) : Float	*/
  density_at_15c: number;
  /**	Tank State at Receipt : Data	*/
  tank_state_at_receipt?: string;
  /**	Measurement Uncertainty (%) : Float - Standard uncertainty of this dip/temperature/density measurement, from the instrument's calibration certificate. Feeds Reconciliation's combined measurement uncertainty (Phase 4).	*/
  measurement_uncertainty_percent?: number;
  /**	Volume Correction Factor (VCF) : Float	*/
  volume_correction_factor?: number;
  /**	Gross Observed Volume (KL) : Float	*/
  gross_observed_volume_kl?: number;
  /**	Net Standard Volume @15C (KL) : Float	*/
  net_standard_volume_kl?: number;
  /**	Dispatched Quantity (KL) : Float - Planned volume from the originating Pipeline Batch, for Reconciliation (Phase 4).	*/
  dispatched_quantity_kl?: number;
  /**	Stock Entry : Link - Stock Entry - The Material Transfer Stock Entry this Terminal Receipt posted - reversed automatically if this Terminal Receipt is cancelled.	*/
  stock_entry?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
