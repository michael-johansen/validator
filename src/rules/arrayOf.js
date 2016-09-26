import { keys, map, omit } from 'lodash';
import Validator from '../validator';

import type { IfCheck } from '../validator';


export type ArrayOfConfig = {
  if?: IfCheck,
  [field: string]: FieldConfig,
}


export default function arrayOf(field, value, options) {
  const validator = new Validator(options);
  return map(value, item => validator.validate(keys(omit(options, 'values')), item));
}
