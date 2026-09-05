export interface PipelineBatch {
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
  /**	Nomination : Link - Nomination	*/
  nomination: string;
  /**	Journey Reference : Link - Journey	*/
  journey_ref?: string;
  /**	Product : Link - Item	*/
  product?: string;
  /**	Origin Terminal : Link - Terminal	*/
  origin_terminal?: string;
  /**	Destination Terminal : Link - Terminal	*/
  destination_terminal?: string;
  /**	Pumping Sequence No : Int - Position of this slug in the pipeline interface (pumping) sequence, unique within a route. Required so batch adjacency can be determined for the Product Compatibility check.	*/
  batch_sequence_no: number;
  /**	Planned Volume (KL) : Float	*/
  planned_volume_kl: number;
  /**	Capacity Assessment : Link - Capacity Assessment - Route capacity plan this batch is validated against.	*/
  capacity_assessment?: string;
  /**	Interface Cut Volume (KL) : Float - Transmix/interface cut volume planned at this batch's boundary. Required when the Product Compatibility rule against an adjacent batch is 'Requires Interface Cut'; must meet that rule's minimum.	*/
  interface_cut_kl?: number;
  /**	Scheduled Start : Datetime	*/
  scheduled_start: string;
  /**	Scheduled End : Datetime	*/
  scheduled_end: string;
  /**	Remarks : Small Text	*/
  remarks?: string;
}
