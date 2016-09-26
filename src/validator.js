/* @flow */
import freeze from 'deep-freeze';
import {
  assign,
  constant,
  get,
  isBoolean,
  isFunction,
  isUndefined,
  isArray,
  keys,
  map,
  flatten,
  forEach,
  omit,
  reduce,
  reject,
} from 'lodash';

import * as rules from './rules';
import { UnknownRuleError } from './errors';
import type { AgeByDateConfig } from './rules/ageByDate';
import type { ArrayOfConfig } from './rules/arrayOf';
import type { DateConfig } from './rules/date';
import type { LengthConfig } from './rules/length';
import type { NumericConfig } from './rules/numeric';
import type { RegexpConfig } from './rules/regex';
import type { RequiredConfig } from './rules/required';

export type IfCheck = (fields: {[key: string]: mixed}) => boolean

export type RuleConfig = boolean | {
  if?: IfCheck,
  [key: string]: mixed,
}

export type FieldConfig = {
  ageByDate?: AgeByDateConfig,
  arrayOf?: ArrayOfConfig,
  date?: DateConfig,
  length?: LengthConfig,
  numeric?: NumericConfig,
  regex?: RegexpConfig,
  required?: RequiredConfig,
  [rule: string]: RuleConfig,
}

export type ValidatorConfig = {
  [field: string]: FieldConfig,
}

export type ValidatorError = {
   field: string,
   rule: string,
   value: mixed,
   config: {[key: string]: mixed},
}

export type ValidatorErrors = { [field: string]: ValidatorError }


function createError(field, error, value, config) {
  if (isArray(error)) {
    return flatten(map(error, (nestedError, i) =>
      map(keys(nestedError), (key) =>
        createError(`${field}[${i}].${key}`,
          nestedError[key].rule, nestedError[key].value, nestedError[key].config)))
    );
  }
  return { field, rule: error, value, config };
}

export default class Validator {
  config: ValidatorConfig;
  errors: ValidatorErrors;

  constructor(config: ValidatorConfig) {
    if (!config) { throw new Error('Missing validator configuration'); }
    this.config = freeze(config);
    this.errors = {};
  }

  getErrors() {
    return freeze(this.errors);
  }

  validate(fields: Array<string>, data: {[key: string]: mixed}) {
    this.errors = {};
    map(fields, field => this.validateField(field, get(data, field), data));
    return freeze(this.errors);
  }

  validateMultiple(fields: Array<string>, data: {[key: string]: mixed}) {
    return reduce(keys(data), (lastValue, key) => assign(
      {},
      lastValue,
      { [key]: this.validate(fields, data[key]) }
    ), {});
  }

  validateField(field: string, value: mixed, values: {[key: string]: mixed} = {}) {
    let error = null;
    if (this.hasRulesForField(field)) {
      error = this.validateRule('required', field, value, { values, force: true });

      const fieldIsFilled = !error;

      if (error !== null && !this.evaluateIf(field, 'required', { values })) {
        error = null;
      }

      if (fieldIsFilled) {
        const fieldRules = reject(keys(this.config[field]), 'required');
        for (let i = 0; i < fieldRules.length; i++) {
          const ruleName = fieldRules[i];
          const ruleConfig = this.getRuleConfig(field, ruleName);
          error = this.validateRule(ruleName, field, value, assign({}, ruleConfig, { values }));

          if (error !== null) {
            break;
          }
        }
      }
    }

    if (error) {
      if (isArray(error)) {
        forEach(error, (nestedError) => {
          this.errors = assign({}, this.errors, { [nestedError.field]: nestedError });
        });
      } else {
        this.errors = assign({}, this.errors, { [error.field]: error });
      }
    } else {
      this.removeError(field);
    }

    return error;
  }

  validateRule(ruleName, field, value, options) {
    if (!options.force && !this.evaluateIf(field, ruleName, options)) {
      return null;
    }

    if (!Validator.rules.hasOwnProperty(ruleName)) {
      throw new UnknownRuleError(`Cannot find rule '${ruleName}'`);
    }

    const error = Validator.rules[ruleName](field, value, options);

    if (error) {
      return createError(field, error, value, this.config[field]);
    }

    return error;
  }

  evaluateIf(field, ruleName, options = {}) {
    const ruleConfig = this.getRuleConfig(field, ruleName);

    if (isUndefined(ruleConfig)) {
      return false;
    }

    let condition = get(ruleConfig, 'if');
    if (isBoolean(ruleConfig)) {
      condition = constant(ruleConfig);
    }

    if (isFunction(condition)) {
      return !!condition(get(options, 'values', {}));
    }

    return true;
  }

  hasRulesForField(field) {
    return this.config.hasOwnProperty(field);
  }

  getRuleConfig(field, ruleName) {
    return get(this.config[field], ruleName);
  }

  removeError(field) {
    if (this.errors.hasOwnProperty(field)) {
      this.errors = omit(this.errors, field);
    }
  }
}

Validator.rules = rules;
