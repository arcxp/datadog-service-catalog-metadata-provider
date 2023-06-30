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
const {
  expandObjectInputs,
  forceArray,
  forceObject,
} = require('./input-expander')

const { mapField, convenienceFields, schemaFields } = require('./fieldMappings')

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
      .map((fieldName) => {
        const mapping = mapField(fieldName, version)(core.getInput(fieldName))
        core.debug(
          `Field ${fieldName} maps to output: ${JSON.stringify(mapping)}`,
        )
        return mapping
      }),
  )

  for (const fieldName of convenienceFields) {
    const input = core.getInput(fieldName)

    if (_.isEmpty(input)) continue

    core.debug(
      `Convenience field ${fieldName} for version ${version} has input: ${input}`,
    )
    core.debug(
      JSON.stringify(
        { [`BEFORE:convenience_field:${fieldName}`]: configs },
        undefined,
        2,
      ),
    )
    configs = mapField(fieldName, version)(input, configs)
    core.debug(
      JSON.stringify(
        { [`AFTER:convenience_field:${fieldName}`]: configs },
        undefined,
        2,
      ),
    )
  }

  return configs
}

module.exports = { inputsToRegistryDocument }
