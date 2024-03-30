// Seed these for GitHub's toolkit
const path = require('path')
process.env.GITHUB_EVENT_PATH = path.join(
  __dirname,
  './data/github-context-payload.json',
)
process.env.GITHUB_REPOSITORY =
  'arcxp/datadog-service-catalog-metadata-provider'

const YAML = require('yaml')

// Pulling this in here activates the mocking of the github module
const github = require('@actions/github')

// Need to use inputs for some of our parameters
const core = require('@actions/core')

const _ = require('lodash')

const { readFile } = require('fs/promises')

// This lets us get the inputs the way that they will actually come in.
const {
  inputsToRegistryDocument,
} = require('../lib/input-to-registry-document')
const {
  // applyOrgRules,
  _test: {
    // fetchRemoteRules,
    // ghHandle,
    // determineApplicabilityOfRule,
    // determineRuleCompliance,
  },
} = require('../lib/org-rules')

const Ajv = require('ajv')

describe('Validate for schema v2', () => {
  beforeAll(() => {
    core.__resetInputsObject()
  })
  const ddSchema_v2 = require('./data/datadog-service-catalog-schema-v2.json')
  const validate_v2 = new Ajv({
    strict: false,
    validateFormats: false,
  }).compile(ddSchema_v2)

  test('read and validate workflow', async () => {
    const workflowContent = await readFile(
      '.github/workflows/v2-automated-testing.yml',
      { encoding: 'utf8' },
    )
    const parsedWorkflow = _.last(
      YAML.parse(workflowContent)?.jobs?.['automated-testing']?.steps,
    )?.with

    core.__setInputsObject(parsedWorkflow)
    const serviceDefinition = inputsToRegistryDocument()

    console.log(
      JSON.stringify({ parsedWorkflow, serviceDefinition }, undefined, 2),
    )
    const isValid = validate_v2(serviceDefinition)
    if (!isValid) {
      console.log(validate_v2.errors)
      console.log(validate_v2)
    }
    expect(isValid).toBeTruthy()
  })
})

describe('Validate for schema v2.1', () => {
  beforeAll(() => {
    core.__resetInputsObject()
  })
  const ddSchema_v2_1 = require('./data/datadog-service-catalog-schema-v2.1.json')
  const validate_v2_1 = new Ajv({
    strict: false,
    validateFormats: false,
  }).compile(ddSchema_v2_1)

  test('read and validate workflow', async () => {
    const workflowContent = await readFile(
      '.github/workflows/v2.1-automated-testing.yml',
      { encoding: 'utf8' },
    )
    const parsedWorkflow = _.last(
      YAML.parse(workflowContent)?.jobs?.['automated-testing']?.steps,
    )?.with

    core.__setInputsObject(parsedWorkflow)
    const serviceDefinition = inputsToRegistryDocument()

    console.log({ parsedWorkflow, serviceDefinition })
    const isValid = validate_v2_1(serviceDefinition)
    if (!isValid) {
      console.log(validate_v2_1.errors)
      console.log(validate_v2_1)
    }
    expect(isValid).toBeTruthy()
  })
})

describe('Validate for schema v2.2', () => {
  beforeAll(() => {
    core.__resetInputsObject()
  })
  const ddSchema_v2_2 = require('./data/datadog-service-catalog-schema-v2.2.json')
  const validate_v2_2 = new Ajv({
    strict: false,
    validateFormats: false,
  }).compile(ddSchema_v2_2)

  test('read and validate workflow', async () => {
    const workflowContent = await readFile(
      '.github/workflows/v2.2-automated-testing.yml',
      { encoding: 'utf8' },
    )
    const parsedWorkflow = _.last(
      YAML.parse(workflowContent)?.jobs?.['automated-testing']?.steps,
    )?.with

    core.__setInputsObject(parsedWorkflow)
    const serviceDefinition = inputsToRegistryDocument()

    console.log({ parsedWorkflow, serviceDefinition })
    const isValid = validate_v2_2(serviceDefinition)
    if (!isValid) {
      console.log(validate_v2_2.errors)
      console.log(validate_v2_2)
    }
    expect(isValid).toBeTruthy()
  })
})
