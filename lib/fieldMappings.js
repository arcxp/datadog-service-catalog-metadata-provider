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

/**
 * This is the list of mappings which tracks which fields map to different versions in different ways.
 * - Keyed by the GitHub Actions input name (action.yml)
 * - Values are objects keyed with version tags
 * - Values of those objects are the function which maps the input value to the registry document value.
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
    mapToUsing('contacts', simpleYamlParse),
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

  integrations: {},

  docs: {},

  repo: {},

  application: {},

  description: {},

  tier: {},

  lifecycle: {},

  email: {},

  'slack-support-channel': {},

  repo: {},
}
const mapField = (field, version) => (input) =>
  mappings?.[field]?.[version](input)

module.exports = {
  mappings,
  mapField,
}
