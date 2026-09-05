import { type QualityParameterResult } from './QualityParameterResult';

export interface QualityResult {
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
  /**	Status : Select	*/
  workflow_state?: 'Pending' | 'Accepted' | 'Quarantined';
  /**	Tank / Sample Source : Link - Oil Tank	*/
  tank?: string;
  /**	Product : Link - Item	*/
  product: string;
  /**	Lab Reference No : Data	*/
  lab_reference_no?: string;
  /**	Sample Date/Time : Datetime	*/
  sample_datetime: string;
  /**	Parameters : Table - Quality Parameter Result	*/
  parameters: QualityParameterResult[];
  /**	Overall Result : Select	*/
  overall_result?: '' | 'Pass' | 'Fail';
  /**	Approved By : Link - User	*/
  approved_by?: string;
  /**	Approved On : Datetime	*/
  approved_on?: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
