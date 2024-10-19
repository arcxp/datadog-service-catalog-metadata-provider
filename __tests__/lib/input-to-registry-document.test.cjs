/**
 * This test covers schema validation for all v2 schema.
 * All v3 schema validation will take place in separate tests.
 * @jest-environment node
 * @group ci
 * @author Mike Stemle <hello@mikestemle.com>
 **/

const YAML = require('yaml')
const core = require('@actions/core')

const Ajv = require('ajv')
const ddSchema_v2 = require('../data/datadog-service-catalog-schema-v2.json')
const ddSchema_v2_1 = require('../data/datadog-service-catalog-schema-v2.1.json')
const ddSchema_v2_2 = require('../data/datadog-service-catalog-schema-v2.2.json')
const validate_v2 = new Ajv({ strict: false, validateFormats: false }).compile(
  ddSchema_v2
)
const validate_v2_1 = new Ajv({
  strict: false,
  validateFormats: false,
}).compile(ddSchema_v2_1)
const validate_v2_2 = new Ajv({
  strict: false,
  validateFormats: false,
}).compile(ddSchema_v2_2)

const {
  inputsToRegistryDocument,
} = require('../../lib/input-to-registry-document')

/// ----------------------------
/// SCHEMA V2.1
/// ----------------------------

describe('input-to-registry-document.js - schema v2', () => {
  test('#inputsToRegistryDocument() - 100% input', async () => {
    const testInput = `
---
schema-version: v2
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
  - other :   value
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
  pagerduty: https://my-org.pagerduty.com/service-directory/PMyService
contacts: |
  - name: DBA Team Email Alias
    type: email
    contact: dba-team-name-here@fakeemaildomainthatdoesntexist.com
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = inputsToRegistryDocument()
    expect(validate_v2(inputs)).toStrictEqual(true)
    if (validate_v2.errors) {
      console.error(validate_v2.errors)
    }
    expect(validate_v2.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
    expect(Array.isArray(inputs.links)).toBeTruthy()
    expect(inputs.links.length).toEqual(1)
  })

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
  - other :   value
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
    const inputs = inputsToRegistryDocument()
    expect(validate_v2(inputs)).toStrictEqual(true)
    if (validate_v2.errors) {
      console.error(validate_v2.errors)
    }
    expect(validate_v2.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
  })

  test('#inputsToRegistryDocument() - less input', async () => {
    const testInput = `
---
schema-version: v2
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
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = inputsToRegistryDocument()
    expect(validate_v2(inputs)).toStrictEqual(true)
    if (!validate_v2(inputs)) {
      console.error(validate_v2_1.errors)
    }
    expect(validate_v2.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
    expect(inputs.links).toBeUndefined()
    expect(inputs.docs).toBeUndefined()
  })
})

/// ----------------------------
/// SCHEMA V2.1
/// ----------------------------

describe('input-to-registry-document.js - schema v2.1', () => {
  test('#inputsToRegistryDocument() - 100% input', async () => {
    const testInput = `
---
schema-version: v2.1
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
  - other :   value
links: |
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
  - url: https://github.com/actions/toolkit
    type: repo
    name: "@actions/toolkit"
  - name: GitHub Actions!
    url: https://github.com/features/actions
    type: doc
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
  pagerduty:
    service-url: https://my-org.pagerduty.com/service-directory/PMyService
contacts: |
  - name: DBA Team Email Alias
    type: email
    contact: dba-team-name-here@fakeemaildomainthatdoesntexist.com
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = inputsToRegistryDocument()
    if (!validate_v2_1(inputs)) {
      console.error(validate_v2_1.errors)
    }
    expect(validate_v2_1(inputs)).toStrictEqual(true)
    expect(validate_v2_1.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
    expect(Array.isArray(inputs.links)).toBeTruthy()
    expect(inputs.links.length).toEqual(4)
  })

  test('#inputsToRegistryDocument() - normal input', async () => {
    const testInput = `
---
schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: datadog-service-catalog-metadata-provider-test
team: Team Name Here
description: This description describes a service.
tier: Tier 1
lifecycle: production
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000000'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
tags: |
  - 'application:GitHub Action Config Test'
  - env:prod
  - infrastructure:serverless
  - language:nodejs
  - other :   value
links: |
  - url: https://github.com/actions/toolkit
    type: repo
    name: "@actions/toolkit"
    provider: GitHub
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
  - name: GitHub Actions!
    url: https://github.com/features/actions
    type: doc
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = inputsToRegistryDocument()
    if (!validate_v2_1(inputs)) {
      console.error(validate_v2_1.errors)
    }
    expect(validate_v2_1(inputs)).toStrictEqual(true)
    expect(validate_v2_1.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
  })

  test('#inputsToRegistryDocument() - less input', async () => {
    const testInput = `
---
schema-version: v2.1
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
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
    `

    core.__setInputsObject(YAML.parse(testInput))
    const inputs = inputsToRegistryDocument()
    if (!validate_v2_1(inputs)) {
      console.error(validate_v2_1.errors)
    }
    expect(validate_v2_1(inputs)).toStrictEqual(true)
    expect(validate_v2_1.errors).toBeNull()
    expect(inputs).toMatchSnapshot()
    expect(Array.isArray(inputs.links)).toBeTruthy()
    expect(inputs.links.length).toBe(1)
    expect(inputs.docs).toBeUndefined()
  })
})
