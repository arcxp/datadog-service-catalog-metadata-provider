const YAML = require('yaml')
const core = require('@actions/core')
const subject = require('../../lib/component-mappings.cjs')
const { readFileSync } = require('node:fs')

// set up the schema validators
const Ajv = require('ajv')
const schema = new Ajv({ strict: false, validateFormats: false })
schema.addSchema(require('../data/v3/metadata.schema.json'), 'metadata')
schema.addSchema(require('../data/v3/entity.schema.json'), 'entity')
schema.addSchema(require('../data/v3/integration.schema.json'), 'integration')

// Adding refs
schema.addSchema(
  require('../data/v3/integration_opsgenie.schema.json'),
  'integration_opsgenie.schema.json'
)
schema.addSchema(
  require('../data/v3/integration_pagerduty.schema.json'),
  'integration_pagerduty.schema.json'
)

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

// Test the various schema individually and collectively
describe.each([
  {
    label: 'metadata',
    func: subject._test.mapComponentMetadata,
    funcName: 'mapComponentMetadata',
    sample: 'v3-metadata.yaml',
  },
  {
    label: 'entity',
    func: subject._test.mapEntityComponent,
    funcName: 'mapEntityComponent',
    sample: 'v3-entity.yaml',
  },
  {
    label: 'integration',
    func: subject._test.mapIntegration,
    funcName: 'mapIntegration',
    sample: 'v3-integrations.yaml',
  },
])('$label - $funcName() - $sample', ({ label, func, funcName, sample }) => {
  const validate = schema.getSchema(label)

  // Let's test the entity types
  test(`#${funcName}() - empty`, () => {
    // Empty works
    expect(func()).toBeUndefined()
  })

  test(`#${funcName}() - full`, () => {
    const parsedTestInput = YAML.parse(
      readFileSync(`__tests__/data/${sample}`, {
        encoding: 'utf8',
      })
    )
    const output = func(core, parsedTestInput)
    expect(output).toMatchSnapshot()
    const doesItValidate = validate(output)
    if (validate.errors) {
      console.debug(validate.errors)
    }
    expect(doesItValidate).toStrictEqual(true)
    expect(validate.errors).toBeNull()
  })
})
