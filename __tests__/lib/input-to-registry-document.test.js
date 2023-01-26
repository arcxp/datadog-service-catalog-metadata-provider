const YAML = require('yaml')
const core = require('@actions/core')

const Ajv = require('ajv')
const ddSchema = require('../data/datadog-service-catalog-schema.json')
const validate = new Ajv({ strict: false, validateFormats: false }).compile(
  ddSchema,
)

const { expandObjectInputs } = require('../../lib/input-expander')
const {
  inputsToRegistryDocument,
} = require('../../lib/input-to-registry-document')

describe('input-to-registry-document.js', () => {
  test('#inputsToRegistryDocument() - normal input', async () => {
    const testInput = `
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: datadog-service-catalog-metadata-provider-test
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000000'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
tags: |
  - 'application:GitHub Action Config Test'
  - env:prod
  - infrastructure:serverless
  - language:nodejs
repos: |
  - url: https://github.com/actions/toolkit
    provider: Github
    name: "@actions/toolkit"
links: |
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
docs: |
  - name: GitHub Actions!
    url: https://github.com/features/actions
    provider: Github
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = await inputsToRegistryDocument()
    expect(validate(inputs)).toStrictEqual(true)
    expect(validate.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
  })

  test('#inputsToRegistryDocument() - less input', async () => {
    const testInput = `
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: datadog-service-catalog-metadata-provider-test
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000000'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
tags: |
  - 'application:GitHub Action Config Test'
  - env:prod
  - infrastructure:serverless
  - language:nodejs
repos: |
  - url: https://github.com/actions/toolkit
    provider: Github
    name: "@actions/toolkit"
docs: |
  - name: GitHub Actions!
    url: https://github.com/features/actions
    provider: Github
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = await inputsToRegistryDocument()
    expect(validate(inputs)).toStrictEqual(true)
    expect(validate.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
  })
})
