export interface QualityParameterResult {
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
  /**	Parameter : Select	*/
  parameter:
    | 'Density @ 15C'
    | 'Water Content'
    | 'Sediment'
    | 'Flash Point'
    | 'Sulphur Content'
    | 'Octane/Cetane Number'
    | 'Colour'
    | 'Appearance'
    | 'Other';
  /**	UOM : Data	*/
  uom?: string;
  /**	Spec Min : Float	*/
  specification_min?: number;
  /**	Spec Max : Float	*/
  specification_max?: number;
  /**	Result : Float	*/
  result_value: number;
  /**	Within Spec : Check	*/
  is_within_spec?: 0 | 1;
}
