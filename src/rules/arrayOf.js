/* @flow */
import { keys, map, omit } from 'lodash';
import Validator from '../validator';

import type { ValidatorConfig } from '../validator';

export default function arrayOf(field: string, value: mixed, options: ValidatorConfig) {
  const validator = new Validator(options);
  return map(value, item => validator.validate(keys(omit(options, 'values')), item));
}
