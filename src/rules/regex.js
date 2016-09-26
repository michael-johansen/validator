import { isString } from 'lodash';

import type { IfCheck } from '../validator';

export type RegexpConfig = {
  if?: IfCheck,
  pattern: string | RegExp,
}


export default function regex(field, value, options) {
  const pattern = isString(options.pattern) ? new RegExp(options.pattern) : options.pattern;

  if (!pattern.test(value)) {
    return 'regex';
  }

  return null;
}
