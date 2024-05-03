/**
 * This module contains the logic for converting the Action inputs into a registry document for Datadog.
 * @module lib/input-to-registry-document
 * @requires fs
 * @requires path
 * @requires @actions/core
 * @requires lodash
 * @author Mike Stemle <hello@mikestemle.com>
 **/

const core = require('@actions/core')

const { inputMapperByVersion } = require('./schema-versions.cjs')

/**
 * This function takes the inputs from the Action and converts them into a registry document for Datadog.
 * @returns {object} - The registry document.
 * @public
 * @function
 */
const inputsToRegistryDocument = () =>
  inputMapperByVersion(core.getInput('schema-version') ?? 'v2')(core)

module.exports = { inputsToRegistryDocument }
