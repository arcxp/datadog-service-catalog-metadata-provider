const YAML = require('yaml')
const core = require('@actions/core')
const subject = require('../../lib/component-mappings.cjs')
const { readFileSync } = require('node:fs')

// set up the schema validators
const Ajv = require('ajv')
const schema = new Ajv({ strict: false, validateFormats: false })
schema.addSchema(require('../data/v3/metadata.schema.json'), 'metadata')

describe('imports', () => {
  test('verify imports', () => {
    expect(subject).toMatchObject({
      mapComponents: expect.any(Function),
      _test: expect.objectContaining({
        mapComponentMetadata: expect.any(Function),
        mapEntityComponent: expect.any(Function),
        mapServiceComponent: expect.any(Function),
        mapDatastoreComponent: expect.any(Function),
      }),
    })
  })
})

describe('component metadata', () => {
  const validate = schema.getSchema('metadata')

  // Let's test the entity types
  test('#mapComponentMetadata() - empty', () => {
    // Empty works
    expect(subject._test.mapComponentMetadata()).toMatchObject({})
  })

  test('#mapComponentMetadata() - full', () => {
    const testInput = readFileSync('__tests__/data/v3-metadata.yaml', {
      encoding: 'utf8',
    })
    const parsedTestInput = YAML.parse(testInput)
    const metadataOutput = subject._test.mapComponentMetadata(
      core,
      parsedTestInput
    )
    expect(metadataOutput).toMatchSnapshot()
    const doesItValidate = validate(metadataOutput)
    if (validate.errors) {
      console.debug(validate.errors)
    }
    expect(doesItValidate).toStrictEqual(true)
    expect(validate.errors).toBeNull()
  })
})

/*
describe('entity types', () => {
  // Let's test the entity types
})

describe('service types', () => {
  // Let's test the service types
})

describe('datastore types', () => {
  // Let's test the datastore types
})

describe('handle the full list of components', () => {
  // Let's test the full list of components
})*/
