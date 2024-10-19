// const { get } = require('./convenience-mappings.cjs')
const _ = require('lodash')

// TODO:
// - Parse the components out into YAML
// - Run them through the mapping functions
const mapComponents = (core) => {}

const mapComponentMetadata = (core, componentObject = {}) => {
  return _.omitBy(
    {
      inheritFrom: componentObject?.['inherit-from'],
      owner: componentObject?.owner ?? componentObject?.team,
      additionalOwners: componentObject?.['additional-owners']?.map((x) => ({
        name: x,
      })),
      name: componentObject?.name,
      namespace: componentObject?.namespace,
      description: componentObject?.description,
      displayName: componentObject?.['display-name'],
      tags: componentObject?.tags,
      contacts: componentObject?.contacts,
      links: componentObject?.links,
    },
    _.isUndefined
  )
}

const mapEntityComponent = (core, componentObject = {}) => {
  return {
    metadata: mapComponentMetadata(core, componentObject),
  }
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
    mapServiceComponent,
    mapDatastoreComponent,
  },
}
