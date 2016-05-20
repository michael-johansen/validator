/* @flow */
import { assign } from 'lodash';

import Validator from './validator';

export default (rules: { [key:string]:any }) => {
  Validator.rules = assign({}, Validator.rules, rules);
  return Validator;
};
