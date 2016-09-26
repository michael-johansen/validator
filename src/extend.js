/* @flow */
import { assign } from 'lodash';

import Validator from './validator';
import type { ValidatorRule } from './rules';

export default (rules: {[key: string]: ValidatorRule}) => {
  Validator.rules = assign({}, Validator.rules, rules);
  return Validator;
};
