import { isArray, isEmpty, isString, isNumber, isBoolean } from 'lodash';

import type { IfCheck } from '../validator';

export type RequiredConfig = boolean | { if: IfCheck }

export default function required(field, value) {
  let result = false;

  if (isString(value)) {
    result = !!value.trim();
  } else if (isArray(value)) {
    result = !isEmpty(value);
  } else if (isNumber(value)) {
    result = !!value.toString();
  } else if (isBoolean(value)) {
    return null;
  } else {
    result = !!value;
  }

  return result ? null : 'required';
}
