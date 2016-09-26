/* @flow */
import type { IfCheck } from '../validator';

export type RegexpConfig = {
  if?: IfCheck,
  pattern: string | RegExp,
}

export default function regex(field: string, value: string, options: RegexpConfig) {
  const pattern: RegExp = typeof options.pattern === 'string' ? new RegExp(options.pattern) : options.pattern;

  if (!pattern.test(value)) {
    return 'regex';
  }

  return null;
}
