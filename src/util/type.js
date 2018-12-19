export function typeOf(v) {
  return typeof v;
}

export function isObject(v) {
  return typeOf(v) === 'object';
}
export function isString(v) {
  return typeOf(v) === 'string';
}
export function isNumber(v) {
  return typeOf(v) === 'number' && !Number.isNaN(v) && Number.isFinite(v);
}

export function isUndefined(v) {
  return typeOf(v) === 'undefined';
}

export function isArray(v) {
  return Array.isArray(v);
}

export function isFunction(v) {
  return typeOf(v) === 'function';
}

export function instanceOf(v, Clazz) {
  return v instanceof Clazz;
}

export function isDOMNode(ele) {
  return instanceOf(ele, Node);
}

export function isPropertyEnumerable(obj, key) {
  return obj.propertyIsEnumerable(key);
}
export function getOwnPropertySymbols(obj) {
  return Object.getOwnPropertySymbols(obj);
}