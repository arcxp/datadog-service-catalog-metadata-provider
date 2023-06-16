/**
 * input-expander.js
 * DDSCMP
 * @desc This module contains all of the functions which expand scalar
 *       input from GitHub Actions into hydrated structures for the DD API.
 *
 * @author Michael D. Stemle, Jr
 */

const core = require('@actions/core')
const YAML = require('yaml')

/**
 * As part of our recursive implementation, we need
 * to engage in a little bit of type inference.
 * @private
 * @param {string} x - The input value.
 * @returns {Object|Symbol} The parsed YAML object, or a Symbol.
 */
const parseSafely = (x) => {
  try {
    return YAML.parse(x)
  } catch (e) {
    return Symbol('This will never match.')
  }
}

/**
 * As part of our recursive implementation, we need to be able to break down different types. This tells us if it's an Array.
 * @returns {boolean} Whether or not the input is an array.
 * @private
 **/
const isArray = Array.isArray

/**
 * As part of our recursive implementation, we need to be able to break down different types. This tells us if it's an Object.
 * @param {Object} x - The input value.
 * @returns {boolean} Whether or not the input is an object.
 * @private
 **/
const isObject = (x) => x?.constructor === Object
// this is because `YAML.parse(1)` returns `null`.

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
const isJustAScalar = (x) => !x || x[0] === '@' || x === parseSafely(`${x}`)

/**
 * This function deserializes YAML strings which contain
 * YAML which we also want to deserialize. This is all thanks to
 * some of the constraints we have from GitHub Actions.
 * @private
 */
const deserializeNestedStrings = (input) => {
  if (isYamlScalarEquivalent(input)) {
    return isJustAScalar(input)
      ? input
      : deserializeNestedStrings(parseSafely(input))
  }

  if (isArray(input)) {
    return input.map((x) => deserializeNestedStrings(x))
  }

  if (isObject(input)) {
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
  try {
    return deserializeNestedStrings(str)
  } catch (error) {
    core.debug(`Input as <<${str}>> is not a valid YAML object.`)
    core.error(error)
    core.setFailed(error.message)
  }
}

/**
 * This function takes an input and forces it to be an array.
 * @param {any} input - The input to force into an array.
 * @returns {array} - The input as an array.
 * @public
 * @function
 */
const forceArray = (input) =>
  Array.isArray(input) ? input : input && input.length > 0 ? [input] : []

/**
 * This function takes an input and forces it to be an object.
 * @param {any} input - The input to force into an object.
 * @returns {object} - The input as an object.
 * @public
 * @function
 */
const forceObject = (input) => (typeof input === 'object' ? input : {})

module.exports = {
  expandObjectInputs,
  forceArray,
  forceObject,
}
