/* @flow */
import { isArray, isEmpty, isBoolean } from 'lodash';

import type { IfCheck } from '../validator';

export type RequiredConfig = boolean | { if: IfCheck }

export default function required(field: string, value: mixed) {
  let result = false;

  if (typeof value === 'string') {
    result = !!value.trim();
  } else if (isArray(value)) {
    result = !isEmpty(value);
  } else if (typeof value === 'number') {
    result = !!value.toString();
  } else if (isBoolean(value)) {
    return null;
  } else {
    result = !!value;
  }

  return result ? null : 'required';
}
