const core = require('@actions/core')
const YAML = require('yaml')

/*
 * As part of our recursive implementation, we need
 * to engage in a little bit of type inference.
 */
const isArray = Array.isArray
const isObject = (x) => x?.constructor === Object
// this is because `YAML.parse(1)` returns `null`.
const isYamlScalarEquivalent = (x) => !x || ['string', 'number', 'boolean'].includes(typeof x)
const isJustAScalar = (x) => !x || x === YAML.parse(`${x}`)

/**
 * This function deserializes YAML strings which contain
 * YAML which we also want to deserialize. This is all thanks to
 * some of the constraints we have from GitHub Actions.
 * @private
 */
const deserializeNestedStrings = (input) => {
  if (isYamlScalarEquivalent(input)) {
    return isJustAScalar(input) ? input : deserializeNestedStrings(YAML.parse(input))
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

module.exports = {
  expandObjectInputs,
}
