/**
 * input-expander.js
 * DDSCMP
 * @file This module contains all of the functions which expand scalar
 *       input from GitHub Actions into hydrated structures for the DD API.
 *
 * @author Mike Stemle <hello@mikestemle.com>
 */

// This is my little debug function. Please don't remove.
// const ___ = (note, x) => {
//   console.debug(note, x)
//   return x
// }

const _ = require('lodash')
const core = require('@actions/core')
const YAML = require('yaml')

/**
 * As part of our recursive implementation, we need
 * to engage in a little bit of type inference.
 * @private
 * @param {string} x - The input value.
 * @returns {Object|Symbol} The parsed YAML object, or a Symbol.
 */
const FailedParse = Symbol('This will never match.')
const parseSafely = (x) => {
  try {
    return YAML.parse(x)
  } catch (e) {
    return FailedParse
  }
}

/**
 * As part of our recursive implementation, we need to be able to break down different types. This tells us if it's a scalar or scalar equivalent.
 * @param {any} x - The input value.
 * @returns {boolean} Whether or not the input is a scalar or scalar equivalent.
 * @private
 **/
const isYamlScalarEquivalent = (x) =>
  !x || ['string', 'number', 'boolean'].includes(typeof x)

/**
 * As part of our recursive implementation, we need to be able to break down different types. This tells us if it's a scalar.
 * @param {any} x - The input value.
 * @returns {boolean} Whether or not the input is a scalar.
 * @private
 **/
const isJustAScalar = (x) =>
  !x ||
  x[0] === '@' ||
  parseSafely(`${x}`) === FailedParse ||
  x === parseSafely(`${x}`)

/**
 * This function deserializes YAML strings which contain
 * YAML which we also want to deserialize. This is all thanks to
 * some of the constraints we have from GitHub Actions.
 * @private
 */
const deserializeNestedStrings = (input) => {
  const out = _deserializeNestedStrings(input)
  return out
}

const _deserializeNestedStrings = (input) => {
  if (isYamlScalarEquivalent(input)) {
    return isJustAScalar(input)
      ? input
      : deserializeNestedStrings(parseSafely(input))
  }

  if (_.isArray(input)) {
    return input.map((x) => deserializeNestedStrings(x))
  }

  if (_.isObject(input)) {
    return Object.assign(
      ...Object.keys(input).map((x) => ({
        [x]: deserializeNestedStrings(input[x]),
      })),
    )
  }
}

/**
 * This function takes inputs encoded as strings and expands them to
 * the full array of objects.
 * @param {string} str - The input value.
 * @returns {Object} The input value with all object inputs expanded.
 **/
const expandObjectInputs = (str) => {
  return !!str ? deserializeNestedStrings(str) : str
}

/**
 * This function takes an input and forces it to be an array.
 * @param {any} input - The input to force into an array.
 * @returns {array} - The input as an array.
 * @public
 * @function
 */
const forceArray = (input) =>
  _.isArray(input) ? input : !!input ? [input] : []

/**
 * This function takes an input and forces it to be an object.
 * @param {any} input - The input to force into an object.
 * @returns {object} - The input as an object.
 * @public
 * @function
 */
const forceObject = (input) =>
  _.isObject(input) ? input : _.isEmpty(input) ? {} : { value: input }

/**
 * This function takes an input and a YAML string and returns an array containing the values in the YAML string. The value of the object returned will _always_ be an array.
 * @param {string} str - The YAML string.
 * @returns {Array} - The mapped object.
 * @public
 * @function
 * @see forceArray
 **/
const parseYamlExpectArray = (str) => forceArray(expandObjectInputs(str))

/**
 * This function takes an input and a YAML string and returns an object with the input as the key and the expanded YAML as the value. The value of the object returned will _always_ be an Object.
 * @param {string} str - The YAML string.
 * @returns {object} - The mapped object.
 * @public
 * @function
 * @see expandObjectInputs
 * @see forceObject
 **/
const parseYamlExpectObject = (str) => forceObject(expandObjectInputs(str))

/**
 * This function parses YAML and converts it to a list of Datadog-friendly tags.
 * @param {string} str - The YAML string.
 * @returns {object} - The mapped object.
 * @public
 * @function
 **/
const parseYamlExpectDatadogTags = (str) =>
  forceArray(expandObjectInputs(str)).map((entry) =>
    _.isPlainObject(entry)
      ? _.join(
          _.head(_.toPairs(entry)).map((x) =>
            // This check is so that we trim strings, but don't break
            // numbers or boolean values.
            typeof x === 'string' ? x.trim() : x,
          ),
          ':',
        )
      : entry,
  )

/**
 * Does the value amount to nothing? This is intended to be used for omitting properties lacking user-supplied values.
 * @param {any} testValue - The value to be tested
 * @returns {bool} - A boolean value indicating whether the value is "nothing", and safe to disregard.
 * @public
 * @function
 **/
const isNothing = (testValue) =>
  !_.isDate(testValue) &&
  (_.isObject(testValue) || _.isArray(testValue) || _.isString(testValue))
    ? _.isEmpty(testValue)
    : _.isNil(testValue)

/**
 * Combine the value and the target value. **This function modifies the `target` input.**
 * @param {any} value - The value you'd like to store
 * @param {string} key - The key to store the value in the `target` with
 * @param {Object} target - The target object into which the value shall be stored
 * @returns {Object} - Returns the `target` with the value.
 * @public
 * @function
 **/
const combineValues = (value, key, target) => {
  // Do nothing if there's no value
  if (isNothing(value)) {
    return target
  }

  const assertType = (check, type, func) => {
    if (!func(check)) {
      throw new Error(
        `Value «${JSON.stringify(check, undefined, 2)}» was expected to be of type «${type}», but it isn't.`,
      )
    }
  }

  const ref = target[key]

  if (_.isArray(ref)) {
    assertType(value, 'Array', _.isArray)
    target[key] = _.concat(ref, value)
  } else if (_.isObject(ref)) {
    assertType(value, 'Object', _.isObject)
    target[key] = _.merge(ref, value)
  } else {
    target[key] = value
  }

  return target
}

module.exports = {
  FailedParse,
  parseSafely,
  expandObjectInputs,
  forceArray,
  forceObject,
  parseYamlExpectArray,
  parseYamlExpectObject,
  parseYamlExpectDatadogTags,
  isNothing,
  combineValues,
}
