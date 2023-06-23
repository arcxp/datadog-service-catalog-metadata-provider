/**
 * This module contains the logic for converting the Action inputs into a registry document for Datadog.
 * @module lib/input-to-registry-document
 * @requires fs
 * @requires path
 * @requires @actions/core
 * @requires lodash
 * @author Mike Stemle <themanchicken@duck.com>
 **/

const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
const _ = require('lodash')
const { expandObjectInputs, forceArray, forceObject } = require('./input-expander')

const { mapField, convenienceFields, schemaFields } = require('./fieldMappings')

/**
 * This function takes the inputs from the Action and performs a preliminary mapping for them.
 * @param {object} core - The core module from @actions/core.
 * @param {string} version - The version of the schema to use.
 * @returns {object} - The mapped inputs, with `schema` mapped to schema fields, and `convenience` mapped to convenience fields.
 **/
const collectInputs = (core, version) => ({
  schema: Object.assign(
    ...schemaFields.map((fieldName) =>
      mapField(fieldName, version)(core.getInput(fieldName)),
    ),
  ),
  convenience: Object.assign(
    ...convenienceFields.map((fieldName) =>
      mapField(fieldName, version)(core.getInput(fieldName)),
    ),
  ),
})

/**
 * This function takes the inputs from the Action and converts them into a registry document for Datadog.
 * @returns {object} - The registry document.
 * @public
 * @function
 */
const inputsToRegistryDocument = async () => {
  // This does the initial fetch of configs from the Action inputs.
  const configs = collectInputs(core, core.getInput('schema-version'))

  // Prep the team email contact
  const teamContactEmail = {
    name: 'Team Email',
    type: 'email',
    contact: core.getInput('email'),
  }

  return configs
}

module.exports = { inputsToRegistryDocument }
