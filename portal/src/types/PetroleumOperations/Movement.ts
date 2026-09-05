export interface Movement {
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
  /**	Pipeline Batch : Link - Pipeline Batch	*/
  pipeline_batch: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Product : Link - Item	*/
  product?: string;
  /**	Pipeline Route : Select	*/
  pipeline_route:
    | 'Mombasa-Nairobi (Line 1)'
    | 'Mombasa-Nairobi (Line 2)'
    | 'Nairobi-Eldoret-Kisumu'
    | 'Sinendet-Kisumu'
    | 'Nairobi-Nanyuki';
  /**	Origin Terminal : Link - Terminal	*/
  origin_terminal?: string;
  /**	Destination Terminal : Link - Terminal	*/
  destination_terminal?: string;
  /**	Status : Select	*/
  movement_status?: 'Draft' | 'In Transit' | 'Completed' | 'Halted';
  /**	Start Date/Time : Datetime	*/
  start_datetime?: string;
  /**	End Date/Time : Datetime	*/
  end_datetime?: string;
  /**	Line Pressure (bar) : Float	*/
  monitored_pressure_bar?: number;
  /**	Flow Rate (m3/h) : Float	*/
  monitored_flow_rate_m3h?: number;
  /**	Pump Vibration (mm/s) : Float	*/
  monitored_vibration_mm_s?: number;
  /**	Anomaly Score (0-100) : Float	*/
  anomaly_score?: number;
  /**	Anomaly Severity : Select	*/
  anomaly_severity?: 'Nominal' | 'Low' | 'Medium' | 'High' | 'Critical';
  /**	AI Alert Raised : Check	*/
  alert_triggered?: 0 | 1;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
