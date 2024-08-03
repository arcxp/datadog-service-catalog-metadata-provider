// const { get } = require('./convenience-mappings.cjs')
const _ = require('lodash')

// TODO:
// - Parse the components out into YAML
// - Run them through the mapping functions
const mapComponents = (core) => {}

const mapComponentMetadata = (core, componentObject = {}) => {
  return {
    id: componentObject?.id,
    inheritFrom: componentObject?.inheritFrom,
    owner: { name: componentObject?.owner ?? componentObject?.team },
    additionalOwners: component?.additionalOwners?.map((x) => ({ name: x })),
    name: componentObject?.name,
    namespace: componentObject?.namespace,
    description: componentObject?.description,
    displayName: componentObject?.displayName,
    tags: componentObject?.tags,
    contacts: componentObject?.contacts,
    links: componentObject?.links,
  }
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
