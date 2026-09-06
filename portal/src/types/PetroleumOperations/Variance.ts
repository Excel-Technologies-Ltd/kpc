export interface Variance {
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
  /**	Reconciliation : Link - Reconciliation	*/
  reconciliation: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Variance (KL) : Float	*/
  variance_kl?: number;
  /**	Variance (%) : Percent	*/
  variance_percent?: number;
  /**	Status : Select	*/
  workflow_state?: 'Pending Approval' | 'Approved' | 'Rejected';
  /**	Loss Category : Select	*/
  loss_category:
    | 'Evaporation'
    | 'Measurement Tolerance'
    | 'Temperature Variation'
    | 'Line Fill Change'
    | 'Theft/Pilferage'
    | 'Operational Loss'
    | 'Unexplained'
    | 'Other';
  /**	Classification Notes : Small Text	*/
  classification_notes?: string;
  /**	Approved/Rejected By : Link - User	*/
  approved_by?: string;
  /**	Decided On : Datetime	*/
  approved_on?: string;
}
