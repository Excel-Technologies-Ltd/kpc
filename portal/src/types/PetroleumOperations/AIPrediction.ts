export interface AIPrediction {
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
  /**	Source AI Alert : Link - AI Alert	*/
  ai_alert?: string;
  /**	Prediction Date/Time : Datetime	*/
  prediction_datetime?: string;
  /**	Status : Select	*/
  status?: 'Active' | 'Superseded' | 'Dismissed';
  /**	Anomaly Score (0-100) : Float	*/
  anomaly_score?: number;
  /**	Failure Risk (%) : Float	*/
  failure_risk_percent?: number;
  /**	Risk Horizon : Select	*/
  risk_horizon?: 'Immediate (<24h)' | '7 Days' | '30 Days' | '90 Days';
  /**	Basis : Small Text - Explainability note: which telemetry parameter(s) drove this forecast.	*/
  basis?: string;
}
