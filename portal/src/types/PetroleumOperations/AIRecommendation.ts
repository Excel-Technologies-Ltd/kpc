export interface AIRecommendation {
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
  /**	Movement : Link - Movement	*/
  movement: string;
  /**	Source AI Prediction : Link - AI Prediction	*/
  ai_prediction: string;
  /**	Priority : Select	*/
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  /**	Status : Select	*/
  workflow_state?: 'Pending Approval' | 'Approved' | 'Rejected';
  /**	Recommended Action : Select	*/
  recommended_action:
    | 'Inspect Pump Seals'
    | 'Schedule Descaling'
    | 'Pressure Relief Valve Check'
    | 'Vibration Sensor Calibration'
    | 'Full Pipeline Segment Inspection'
    | 'Other';
  /**	Details : Small Text	*/
  details?: string;
  /**	Approved/Rejected By : Link - User	*/
  approved_by?: string;
  /**	Decided On : Datetime	*/
  approved_on?: string;
}
