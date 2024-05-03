const mapperMatrix = {
  v2: require('./schema-versions/v2.cjs').mapInputs,
  'v2.1': require('./schema-versions/v2.1.cjs').mapInputs,
  'v2.2': require('./schema-versions/v2.2.cjs').mapInputs,
}

const defaultMapper = () => {
  throw Error('Invalid schema version')
}

const inputMapperByVersion = (version) =>
  mapperMatrix?.[version] ?? defaultMapper

module.exports = { inputMapperByVersion, _test: { defaultMapper } }
