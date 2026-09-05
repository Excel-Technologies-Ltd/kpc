export interface Reconciliation {
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
  /**	Terminal Receipt : Link - Terminal Receipt	*/
  terminal_receipt: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Dispatched Quantity (KL) : Float	*/
  dispatched_quantity_kl?: number;
  /**	Received Quantity (KL) : Float	*/
  received_quantity_kl?: number;
  /**	Variance (KL) : Float - Dispatched minus Received. Positive = loss in transit; negative = gain.	*/
  variance_kl?: number;
  /**	Variance (%) : Percent	*/
  variance_percent?: number;
  /**	Within Tolerance : Check	*/
  within_tolerance?: 0 | 1;
  /**	Coverage Factor (k) : Float - GUM expanded-uncertainty coverage factor. k=2 approximates ~95% confidence; raise it for a more conservative (wider) tolerance band.	*/
  coverage_factor: number;
  /**	Origin Measurement Uncertainty (%) : Float - From the latest submitted Tank Measurement on this Journey (the parcel's volume of record entering KPC custody).	*/
  origin_measurement_uncertainty_percent?: number;
  /**	Destination Measurement Uncertainty (%) : Float	*/
  destination_measurement_uncertainty_percent?: number;
  /**	Combined Standard Uncertainty (%) : Float - Root-sum-square of the origin and destination uncertainties: sqrt(origin^2 + destination^2).	*/
  combined_uncertainty_percent?: number;
  /**	Tolerance (%) : Percent - Auto-calculated: Coverage Factor x Combined Standard Uncertainty.	*/
  tolerance_percent?: number;
  /**	Justification : Small Text - Mandatory before this Reconciliation can be accepted (submitted) if the variance exceeds tolerance.	*/
  justification?: string;
  /**	Reconciled By : Link - User	*/
  reconciled_by?: string;
  /**	Reconciled On : Datetime	*/
  reconciled_on?: string;
  /**	Stock Entry : Link - Stock Entry - The Material Issue Stock Entry this Reconciliation posted for a recognised transit loss, if any - reversed automatically if this Reconciliation is cancelled.	*/
  stock_entry?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
