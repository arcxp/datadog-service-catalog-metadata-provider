/**
 * @file This file contains the mappings between the GitHub Actions inputs and the Datadog Service Catalog schema.
 * @module lib/fieldMappings
 * @author Mike Stemle <themanchicken@duck.com>
 **/

const core = require('@actions/core')
const _ = require('lodash')
const {
  expandObjectInputs,
  forceArray,
  forceObject,
} = require('./input-expander')

/**
 * This lets us use the same mapping function for multiple versions.
 * @param {string[]} versions - The versions to use.
 * @param {function} mapper - The mapping function.
 * @returns {object} - The mapping object.
 * @private
 * @function
 **/
const useSharedMappings = (versions, mapper) =>
  Object.assign(...versions.map((x) => ({ [x]: mapper })))

/**
 * This function takes an input name and a mapper function and returns a function which maps the input value to the registry document value.
 * @param {string} input - The input name.
 * @param {function} func - The mapping function.
 * @returns {function} - The mapping function.
 * @private
 * @function
 **/
const mapToUsing = (input, func) => (value) => func(input, value)

/**
 * This function takes an input and a value and returns an object with the input as the key and the value as the value.
 * @param {string} input - The input name.
 * @param {any} value - The value.
 * @returns {object} - The mapped object.
 * @private
 * @function
 **/
const passThru = (input, value) => ({ [input]: value })

/**
 * This function takes an input and a YAML string and returns an object with the input as the key and the expanded YAML as the value.
 * @param {string} input - The input name.
 * @param {string} str - The YAML string.
 * @returns {object} - The mapped object.
 * @private
 * @function
 * @see expandObjectInputs
 **/
const simpleYamlParse = (input, str) => ({ [input]: expandObjectInputs(str) })

/**
 * This function takes an input and a YAML string and returns an object with the input as the key and the expanded YAML as the value. The value of the object returned will _always_ be an array.
 * @param {string} input - The input name.
 * @param {string} str - The YAML string.
 * @returns {object} - The mapped object.
 * @private
 * @function
 * @see expandObjectInputs
 * @see forceArray
 **/
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
}
Object.freeze(mappings)

/**
 * This is the list of fields which are part of the Datadog schema, in one version or another.
 * @type {string[]}
 **/
const schemaFields = _.keys(mappings)
Object.freeze(schemaFields)

const incorporateConvenienceMapping = (inputObj, doc, targetList) => {
  const docCopy = _.cloneDeep(doc)
  docCopy?.[targetList]
    ? docCopy[targetList].push(inputObj)
    : (docCopy[targetList] = [inputObj])
  return docCopy
}

const incorporateConvenienceMappingToObject = (inputObj, doc, targetObject) => {
  const docCopy = _.cloneDeep(doc)
  docCopy?.[targetObject]
    ? (docCopy[targetObject] = _.merge(docCopy[targetObject], inputObj))
    : (docCopy[targetObject] = { ...inputObj })
  return docCopy
}

/**
 * This is the list of fields which are convenience fields, which are mapped to other fields in the registry document.
 * A key difference between this and `mappings` is that the mappers here take two arguments: the input value, as well as the document currently being produced. The function then returns a fresh copy of that document, mutated with the output of the mapper. This is a pure function, and does not mutate the document passed in.
 * @type {Object<string, function>}
 **/
const convenienceMappings = {
  // These fields map into `contacts` in the registry document.
  email: useSharedMappings(['v2', 'v2.1'], (input, doc) =>
    incorporateConvenienceMapping(
      { contact: input, type: 'email' },
      doc,
      'contacts',
    ),
  ),

  slack: useSharedMappings(['v2', 'v2.1'], (input, doc) =>
    incorporateConvenienceMapping(
      { contact: input, type: 'slack' },
      doc,
      'contacts',
    ),
  ),

  // These fields map into `repos` list in the registry document for v2, and into the `links` list in the registry document for v2.1.
  repo: {
    v2: (input, doc) =>
      incorporateConvenienceMapping({ name: 'Repo', url: input }, doc, 'repos'),
    'v2.1': (input, doc) =>
      incorporateConvenienceMapping(
        { name: 'Repo', type: 'repo', url: input },
        doc,
        'links',
      ),
  },

  // These fields map into `integrations` in the registry document.
  opsgenie: useSharedMappings(['v2', 'v2.1'], (input, doc) =>
    incorporateConvenienceMappingToObject(
      { opsgenie: { 'service-url': input } },
      doc,
      'integrations',
    ),
  ),
  pagerduty: {
    v2: (input, doc) =>
      incorporateConvenienceMappingToObject(
        { pagerduty: input },
        doc,
        'integrations',
      ),
    'v2.1': (input, doc) =>
      incorporateConvenienceMappingToObject(
        { pagerduty: { 'service-url': input } },
        doc,
        'integrations',
      ),
  },
}
convenienceMappings['slack-support-channel'] = convenienceMappings.slack
Object.freeze(convenienceMappings)

/**
 * This is the list of fields which are convenience fields, which are mapped to other fields in the registry document.
 * @type {string[]}
 **/
const convenienceFields = _.keys(convenienceMappings)
Object.freeze(convenienceFields)

/**
 * This is a convenience function which takes a field name and a version tag and returns a function which maps the input value to the registry document value.
 * @param {string} field - The name of the field to map.
 * @param {string} version - The version tag to map the field to.
 * @returns {function} - A function which maps the input value to the registry document value.
 * @example
 * const mapField = require('./lib/fieldMappings')
 * const mappedValue = mapField('team', 'v2.1')('my-team')
 * `// mappedValue = { team: 'my-team' }`
 * @public
 * @function
 **/
const mapField =
  (field, version) =>
  (input, doc = undefined) =>
    (
      mappings?.[field]?.[version] ??
      convenienceMappings?.[field]?.[version] ??
      ((_) => core.setFailed(`Unknown field: ${field}`))
    )(input, doc)

module.exports = {
  mappings,
  convenienceFields,
  schemaFields,
  mapField,
}
