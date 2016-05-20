/* @flow */

export function required(field:string, value:any, options:bool = true) {
  if (options === false) { return null; }
  let result = false;
  if (typeof value === 'string') {
    result = !!value.trim();
  } else {
    result = !!value;
  }

  return result ? null : 'required';
}
