import { get, isNil } from 'lodash';

import type { IfCheck } from '../validator';

export type LengthConfig = {
  if?: IfCheck,
  min?: number,
  max?: number,
  exact?: number,
}

export default function length(field, value, options) {
  const min = get(options, 'min');
  const max = get(options, 'max');

  const exact = get(options, 'exact');
  if (!isNil(exact) && value.length !== exact) {
    return 'length.exact';
  }

  if (!isNil(min) && value.length < min) {
    return 'length.min';
  }

  if (!isNil(max) && value.length > max) {
    return 'length.max';
  }

  return null;
}
