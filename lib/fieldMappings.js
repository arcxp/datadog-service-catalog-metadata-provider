const core = require('@actions/core')
const _ = require('lodash')
const {
  expandObjectInputs,
  forceArray,
  forceObject,
} = require('./input-expander')

const useSharedMappings = (versions, mapper) =>
  Object.assign(...versions.map((x) => ({ [x]: mapper })))

const mapToUsing = (input, func) => (value) => func(input, value)

const passThru = (input, value) => ({ [input]: value })
const skipField = (_input, _value) => ({})
const simpleYamlParse = (input, str) => ({ [input]: expandObjectInputs(str) })
const arrayYamlParse = (input, str) => ({
  [input]: forceArray(expandObjectInputs(str)),
})
const objectYamlParse = (input, str) => ({
  [input]: forceObject(expandObjectInputs(str)),
})

const versionCompatibilityError =
  (field, chosenVersion, validVersions) => (_input) =>
    core.setFailed(
      `Sorry, but the «${field}» field is not avaiable in version ${chosenVersion} of the Datadog Service Catalog schema; this field is only available in version(s): ${validVersions.join(
        ',',
      )}`,
    )

/**
 * This is the list of mappings which tracks which fields map to different versions in different ways.
 * - Keyed by the GitHub Actions input name (action.yml)
 * - Values are objects keyed with version tags
 * - Values of those objects are the function which maps the input value to the registry document value.
 * TODO: Add warnings for when folks try to use the wrong schema versions.
 **/
const mappings = {
  'schema-version': useSharedMappings(
    ['v2', 'v2.1'],
    mapToUsing('schema-version', passThru),
  ),

  'service-name': useSharedMappings(
    ['v2', 'v2.1'],
    mapToUsing('dd-service', passThru),
  ),

  team: useSharedMappings(['v2', 'v2.1'], mapToUsing('team', passThru)),

  contacts: useSharedMappings(
    ['v2', 'v2.1'],
    mapToUsing('contacts', arrayYamlParse),
  ),

  // This tags setup is a little hairy, but the biggest thing
  // to keep in mind is that we want a list of strings, made up
  // of colon-separated values. Mercifully, this is the same
  // for both v2 and v2.1.
  tags: useSharedMappings(['v2', 'v2.1'], (input) => ({
    tags: forceArray(expandObjectInputs(input)).map((entry) =>
      _.isPlainObject(entry)
        ? _.join(
            _.head(_.toPairs(entry)).map((x) =>
              typeof x === 'string' ? x.trim() : x,
            ),
            ':',
          )
        : entry,
    ),
  })),

  links: {
    v2: (input) => ({
      links: forceArray(expandObjectInputs(input)).map((x) =>
        // v2 doesn't have a provider field
        _.omit(x, ['provider']),
      ),
    }),
    'v2.1': (input) => ({ links: forceArray(expandObjectInputs(input)) }),
  },

  integrations: useSharedMappings(
    ['v2', 'v2.1'],
    mapToUsing('integrations', objectYamlParse),
  ),

  docs: {
    v2: mapToUsing('docs', arrayYamlParse),
    'v2.1': versionCompatibilityError('docs', 'v2.1', ['v2']),
  },

  repos: {
    v2: mapToUsing('repos', arrayYamlParse),
    'v2.1': versionCompatibilityError('repos', 'v2.1', ['v2']),
  },

  application: {
    v2: versionCompatibilityError('application', 'v2', ['v2.1']),
    'v2.1': mapToUsing('application', passThru),
  },

  description: {
    v2: versionCompatibilityError('description', 'v2', ['v2.1']),
    'v2.1': mapToUsing('description', passThru),
  },

  tier: {
    v2: versionCompatibilityError('tier', 'v2', ['v2.1']),
    'v2.1': mapToUsing('tier', passThru),
  },

  lifecycle: {
    v2: versionCompatibilityError('lifecycle', 'v2', ['v2.1']),
    'v2.1': mapToUsing('lifecycle', passThru),
  },

  email: useSharedMappings(['v2', 'v2.1'], mapToUsing('email', passThru)),

  'slack-support-channel': useSharedMappings(
    ['v2', 'v2.1'],
    mapToUsing('slack-support-channel', passThru),
  ),

  // TODO: Add convenience fields for opsgenie and pagerduty URLs.

  repo: useSharedMappings(['v2', 'v2.1'], mapToUsing('repo', passThru)),
}
const mapField = (field, version) => (input) =>
  (
    mappings?.[field]?.[version] ??
    ((_) => core.setFailed(`Unknown field: ${field}`))
  )(input)

module.exports = {
  mappings,
  mapField,
}
