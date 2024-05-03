/**
 * @file This file maps the GitHub Action's inputs to the v2 schema.
 * @module lib/schema-versions/v2
 * @author Mike Stemle
 **/

const _ = require('lodash')

const {
  parseYamlExpectArray,
  parseYamlExpectObject,
  parseYamlExpectDatadogTags,
  expandObjectInputs,
  isNothing,
  combineValues,
} = require('../input-expander.cjs')

const { getConvenienceFieldValues } = require('../convenience-mappings.cjs')

/**
 * This is function maps the inputs to the output schema version for the API.
 * @param {object} core - The GitHub Actions core object.
 * @returns {Object} - Returns an object containing all of the mapped fields.
 * @private
 * @function
 **/
const mapSchemaFields = (core) =>
  _.omitBy(
    {
      // Schema version is intentionally overridden because the schema version mapping
      // logic has already discovered that `v2` is the value in order to get this far.
      // No need to bother looking up something we already know.
      'schema-version': 'v2.2',
      'dd-service': core.getInput('service-name'),
      team: core.getInput('team'),
      application: core.getInput('application'),
      description: core.getInput('description'),
      type: core.getInput('type'),
      languages: parseYamlExpectArray(core.getInput('languages')),
      tier: core.getInput('tier'),
      lifecycle: core.getInput('lifecycle'),
      contacts: parseYamlExpectArray(core.getInput('contacts')),
      links: parseYamlExpectArray(core.getInput('links')),
      tags: parseYamlExpectDatadogTags(core.getInput('tags')),
      integrations: parseYamlExpectObject(core.getInput('integrations')),
      extensions: expandObjectInputs(core.getInput('extensions')),
    },
    isNothing,
  )

/**
 * Map all relevant fields for this schema version.
 * @param {object} core - The GitHub Actions core object.
 * @returns {Object} - Returns an object containing all of the mapped fields.
 * @public
 * @function
 **/
const mapInputs = (core) => {
  const convenienceValues = getConvenienceFieldValues(core)

  // This is just a shortcut because I don't want to have a big, repetitive list of
  // conditionals.
  const hasValuesForConvenienceKeys = (listOfKeys) => {
    for (const key of listOfKeys) {
      if (!!convenienceValues[key]) return true
    }

    return false
  }

  // Grab the schema fields
  let mappedInputs = mapSchemaFields(core)

  if (
    hasValuesForConvenienceKeys(['email', 'slack', 'slack-support-channel'])
  ) {
    const contactAdditions = _.filter(
      [
        !!convenienceValues['email']
          ? {
              name: 'Primary Email',
              contact: convenienceValues['email'],
              type: 'email',
            }
          : undefined,
        !!convenienceValues['slack']
          ? {
              name: 'Primary Slack Channel',
              contact: convenienceValues['slack'],
              type: 'slack',
            }
          : undefined,
        !!convenienceValues['slack-support-channel']
          ? {
              name: 'Support Channel',
              contact: convenienceValues['slack-support-channel'],
              type: 'slack',
            }
          : undefined,
      ],
      (x) => !_.isNil(x),
    )
    mappedInputs = combineValues(contactAdditions, 'contacts', mappedInputs)
  }

  if (hasValuesForConvenienceKeys(['repo'])) {
    mappedInputs = combineValues(
      [
        {
          url: convenienceValues['repo'],
          name: 'Primary Repository',
          type: 'repo',
        },
      ],
      'links',
      mappedInputs,
    )
  }

  if (hasValuesForConvenienceKeys(['pagerduty', 'opsgenie'])) {
    mappedInputs.integrations ||= {}
  }
  if (!!convenienceValues['pagerduty']) {
    mappedInputs.integrations.pagerduty = {
      'service-url': convenienceValues['pagerduty'],
    }
  }
  if (!!convenienceValues['opsgenie']) {
    mappedInputs.integrations.opsgenie = {
      'service-url': convenienceValues['opsgenie'],
    }
  }

  return mappedInputs
}

module.exports = {
  _test: { mapSchemaFields },
  mapInputs,
}
