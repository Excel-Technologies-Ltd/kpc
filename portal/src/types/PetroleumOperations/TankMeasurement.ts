export interface TankMeasurement {
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
  /**	Shipment : Link - Oil Shipment	*/
  shipment?: string;
  /**	Tank : Link - Oil Tank	*/
  tank: string;
  /**	Measurement Type : Select	*/
  measurement_type: 'Opening' | 'Closing' | 'Interim' | 'Daily Gauge';
  /**	Measurement Date/Time : Datetime	*/
  measurement_datetime: string;
  /**	Observed Level (mm) : Float	*/
  observed_level_mm: number;
  /**	Observed Temperature (C) : Float	*/
  observed_temperature_c: number;
  /**	Free Water Dip (mm) : Float	*/
  water_dip_mm?: number;
  /**	Density at 15C (kg/L) : Float - Fetched from Product master; can be overridden with an observed lab density.	*/
  density_at_15c: number;
  /**	Tank State at Measurement : Data	*/
  tank_state_at_measurement?: string;
  /**	Measurement Uncertainty (%) : Float - Standard uncertainty of this dip/temperature/density measurement, from the instrument's calibration certificate. Feeds Reconciliation's combined measurement uncertainty (Phase 4).	*/
  measurement_uncertainty_percent?: number;
  /**	Volume Correction Factor (VCF) : Float	*/
  volume_correction_factor?: number;
  /**	Gross Observed Volume (KL) : Float	*/
  gross_observed_volume_kl?: number;
  /**	Net Standard Volume @15C (KL) : Float	*/
  net_standard_volume_kl?: number;
  /**	Stock Entry : Link - Stock Entry - The Material Receipt Stock Entry this Closing reading posted, if any - reversed automatically if this Tank Measurement is cancelled.	*/
  stock_entry?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
