const mapperMatrix = {
  v2: require('./schemaVersions/v2.cjs').mapInputs,
}

const defaultMapper = () => {
  throw Error('Invalid schema version')
}

const inputMapperByVersion = (version) =>
  mapperMatrix?.[version] ?? defaultMapper

module.exports = { inputMapperByVersion, _test: { defaultMapper } }
