// const { get } = require('./convenience-mappings.cjs')
const _ = require('lodash')

// TODO:
// - Parse the components out into YAML
// - Run them through the mapping functions
const mapComponents = (core) => {}

/**
 * Maps component metadata to the desired format.
 *
 * @param {Object} core - The instance of our core action in a GitHub Action custom workflow.
 * @param {Object} component - The current component object being mapped.
 *
 * @returns {Object} The mapped component metadata object, excluding properties with `undefined` values.
 *
 * @private
 * @function
 */
const mapComponentMetadata = (core, component = {}) => {
  return _.isEmpty(component)
    ? undefined
    : _.omitBy(
        {
          inheritFrom: component?.['inherit-from'],
          owner: component?.owner ?? component?.team,
          additionalOwners: component?.['additional-owners']?.map(
            (additionalOwner) =>
              _.omitBy(
                {
                  name: additionalOwner?.name,
                  type: additionalOwner?.type,
                },
                _.isUndefined
              )
          ),
          name: component?.name,
          namespace: component?.namespace,
          description: component?.description,
          displayName: component?.['display-name'],
          tags: component?.tags,
          contacts: component?.contacts,
          links: component?.links,
        },
        _.isUndefined
      )
}

/**
 * Maps the input entity to the desired component format.
 *
 * @param {Object} core - The instance of our core action
 * @param {Object} component - The current component object to being mapped.
 *
 * @returns {Object} The component object with selected fields mapped from the input entity.
 * The resulting object excludes properties with `undefined` values.
 *
 * @private
 * @function
 **/
const mapEntityComponent = (core, component = {}) => {
  return _.isEmpty(component)
    ? undefined
    : _.omitBy(
        {
          apiVersion:
            component?.['api-version'] ?? core.getInput('schema-version'),
          kind: component?.kind,
          metadata: mapComponentMetadata(core, component?.metadata),
          integrations: mapIntegration(core, component?.integrations),
        },
        _.isUndefined
      )
}

/**
 * Maps integration metadata to the desired format based on the integration schema.
 *
 * @param {Object} core - The instance of our core action in a GitHub Action custom workflow.
 * @param {Object} integration - The current integration object being mapped.
 *
 * @returns {Object} The integration object with selected fields mapped from the input integration.
 * The resulting object excludes properties with `undefined` values.
 *
 * @private
 * @function
 **/
const mapIntegration = (core, integration = {}) => {
  return _.isEmpty(integration)
    ? undefined
    : _.omitBy(
        {
          pagerduty: integration?.pagerduty?.serviceURL
            ? {
                serviceURL: integration?.pagerduty?.serviceURL,
              }
            : undefined,
          opsgenie: integration?.opsgenie?.serviceURL
            ? {
                serviceURL: integration?.opsgenie?.serviceURL,
                region: integration.opsgenie?.region,
              }
            : undefined,
        },
        _.isUndefined
      )
}

const mapServiceComponent = () => {
  return {}
}

const mapDatastoreComponent = () => {
  return {}
}

module.exports = {
  mapComponents,
  _test: {
    mapComponentMetadata,
    mapEntityComponent,
    mapIntegration,
    mapServiceComponent,
    mapDatastoreComponent,
  },
}
