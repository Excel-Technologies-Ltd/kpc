export interface AIAlert {
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
  /**	Alert Date/Time : Datetime	*/
  alert_datetime?: string;
  /**	Status : Select	*/
  status?: 'Open' | 'Acknowledged' | 'Resolved';
  /**	Anomaly Score (0-100) : Float	*/
  anomaly_score?: number;
  /**	Severity : Select	*/
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  /**	Parameter(s) Breached : Data	*/
  parameter_breached?: string;
  /**	Description : Small Text	*/
  description?: string;
}
