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
// const collectInputs = (core, version) => {
//   const doc = Object.assign(
//     {},
//     ...schemaFields.map((fieldName) =>
//       mapField(fieldName, version)(core.getInput(fieldName)),
//     )

//   return Object.assign(
//     ...convenienceFields.map((fieldName) =>
//       mapField(fieldName, version)(core.getInput(fieldName)),
//     ),
//   )

/**
 * This function takes the inputs from the Action and converts them into a registry document for Datadog.
 * @returns {object} - The registry document.
 * @public
 * @function
 */
const inputsToRegistryDocument = async () => {
  // This does the initial fetch of configs from the Action inputs.
  // const configs = collectInputs(core, core.getInput('schema-version') ?? 'v2')

  const version = core.getInput('schema-version') ?? 'v2'
  let configs = { 'schema-version': version }

  _.merge(
    configs,
    ...schemaFields
      .filter((fieldName) => !!core.getInput(fieldName))
      .map((fieldName) =>
        mapField(fieldName, version)(core.getInput(fieldName)),
      ),
  )
  /*
  for (const fieldName of schemaFields) {
    const input = core.getInput(fieldName)
    if (input === undefined) continue
    Object.assign(configs, mapField(fieldName, version)(input))
  }
  */

  for (const fieldName of convenienceFields) {
    const input = core.getInput(fieldName)
    if (input === undefined) continue
    configs = mapField(fieldName, version)(input, configs)
  }

  core.debug(`Input schema version is «${core.getInput('schema-version')}»`)
  core.debug(`Inputs coming off of configs: ${JSON.stringify(configs, undefined, 2)}`)

  return configs
}

module.exports = { inputsToRegistryDocument }
