export interface MaintenanceWorkOrder {
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
  /**	Journey Reference : Link - Journey - Every Work Order links directly to the Golden Thread, even when raised standalone (not from an AI Recommendation).	*/
  journey_ref: string;
  /**	AI Recommendation : Link - AI Recommendation	*/
  ai_recommendation?: string;
  /**	Movement : Link - Movement	*/
  movement?: string;
  /**	Asset : Link - Plant Asset	*/
  asset?: string;
  /**	Work Order Type : Select	*/
  work_order_type:
    'Inspection' | 'Corrective Maintenance' | 'Preventive Maintenance' | 'Emergency Repair';
  /**	Scheduled Date : Date	*/
  scheduled_date?: string;
  /**	Assigned Employee : Link - Employee	*/
  assigned_employee?: string;
  /**	Required Certification Type : Select - Leave blank if this Work Order needs no specific HSEQ certification. If set, Assigned Employee must hold a current certification of this exact type.	*/
  required_certification_type?:
    | ''
    | 'Pipeline Operations'
    | 'Confined Space Entry'
    | 'Hot Work'
    | 'Working at Height'
    | 'Electrical Isolation'
    | 'Excavation'
    | 'Crane Operation'
    | 'General HSEQ'
    | 'Other';
  /**	Description : Small Text	*/
  description: string;
  /**	Execution Status : Select	*/
  execution_status?: 'Not Started' | 'In Progress' | 'Completed';
  /**	Completion Notes : Small Text	*/
  completion_notes?: string;
  /**	Downtime Hours : Data / Float	*/
  downtime_hours?: number | string;
  /**	Maintenance Cost Kes : Data / Currency	*/
  maintenance_cost_kes?: number | string;
  /**	Amended From : Link - Maintenance Work Order	*/
  amended_from?: string;
}
