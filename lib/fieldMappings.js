const { expandObjectInputs, forceArray, forceObject } = require('./input-expander')

const useSharedMappings = (versions, mapper) => Object.assign(...versions.map((x) => ({ [x]: mapper })))

const passThru = (value) => value


/**
 * This is the list of mappings which tracks which fields map to different versions in different ways.
 * - Keyed by the GitHub Actions input name (action.yml)
 * - Values are objects keyed with version tags
 * - Values of those objects are the function which maps the input value to the registry document value.
 **/
const mappings = {

  'github-token': {
    'v2':1
  },

  'org-rules-file': {},

  'datadog-hostname': {},

  'datadog-key': {},

  'datadog-app-key': {},

  'schema-version': {},

  'service-name': {},

  'team': {},

  'contacts': {},

  'tags': {},

  'links': {},

  'integrations': {},

  'docs': {},

  'repo': {},

  'application': {},

  'description': {},

  'tier': {},

  'lifecycle': {},

  'email': {},

  'slack-support-channel': {},

  'repo': {},
}

module.exports = { mappings }