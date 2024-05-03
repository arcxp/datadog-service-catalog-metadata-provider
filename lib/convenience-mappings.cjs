const _ = require('lodash')

/**
 * Construct an object of convenience field values, and return it so that it can be incorporated into the main document.
 * @param {object} core - The `core` object from the GitHub Actions toolkit.
 * @param {object} overrides - The `overrides` object containing any values from the top-level object. This is used for component mapping only.
 * @returns {object} - Returns an object of convenience field values, by the convenience field value name. It should be noted that only fields with values are returned.
 **/
const getConvenienceFieldValues = (core, overrides = {}) =>
  _.omitBy(
    {
      // These fields map into `contacts` in the registry document.
      email: core.getInput('email'),
      slack: core.getInput('slack'),
      'slack-support-channel': core.getInput('slack-support-channel'),
      repo: core.getInput('repo'),
      opsgenie: core.getInput('opsgenie'),
      pagerduty: core.getInput('pagerduty'),
      ...overrides,
    },
    _.isNil,
  )

module.exports = { getConvenienceFieldValues }
