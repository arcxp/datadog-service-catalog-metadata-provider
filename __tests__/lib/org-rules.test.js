// Seed these for GitHub's toolkit
const path = require('path')

const YAML = require('yaml')

// Pulling this in here activates the mocking of the github module
const github = require('@actions/github')

// Need to use inputs for some of our parameters
const core = require('@actions/core')

// This lets us get the inputs the way that they will actually come in.
const {
  inputsToRegistryDocument,
} = require('../../lib/input-to-registry-document')

const testLocallyOnly = require('../test-locally-only')

// This is our test subject
const {
  fetchAndApplyOrgRules,
  _test: {
    fetchRemoteRules,
    ghHandle,
    currentOrg,
    dotGitHubRepo,
    determineApplicabilityOfRule,
    determineRuleCompliance,
    applyOrgRules,
  },
} = require('../../lib/org-rules')

process.env.GITHUB_EVENT_PATH = path.join(
  __dirname,
  '../data/github-context-payload.json',
)
process.env.GITHUB_REPOSITORY =
  'arcxp/datadog-service-catalog-metadata-provider'

describe('org-rules.js Org Rules the basics', () => {
  test('#ghHandle() - default case', async () => {
    const gh = await ghHandle()
    expect(gh).toBeTruthy()
    expect(gh).toHaveProperty('rest')
    expect(gh).toHaveProperty('auth')
    expect(gh).toHaveProperty('hook')
    expect(gh).toHaveProperty('log')
  })

  test('#ghHandle() - no token in env', async () => {
    const GH_TOKEN = process.env.GITHUB_TOKEN
    core.setFailed = jest.fn()
    delete process.env.GITHUB_TOKEN
    const gh = await ghHandle()

    expect(core.setFailed).toHaveBeenCalledWith('No GitHub token found.')
    expect(gh).toBeUndefined()
    process.env.GITHUB_TOKEN = GH_TOKEN
  })

  test('#currentOrg() - got value', async () => {
    expect(currentOrg()).resolves.toBe('arcxp')
  })

  // This test is only run locally, not in GH Actions CI
  testLocallyOnly('#currentOrg() - no value', async () => {
    const old_gh_repo = process.env.GITHUB_REPOSITORY
    core.setFailed = jest.fn()
    delete process.env.GITHUB_REPOSITORY
    const result = await currentOrg()
    expect(core.setFailed).toHaveBeenCalledWith(
      'This GitHub Actions environment does not have a valid context.',
    )
    expect(result).toBeUndefined()

    process.env.GITHUB_REPOSITORY = old_gh_repo
  })

  test('#dotGitHubRepo() - got value', async () => {
    expect(dotGitHubRepo()).resolves.toBe('arcxp/.github')
  })

  testLocallyOnly('#dotGitHubRepo() - no value', async () => {
    const old_gh_repo = process.env.GITHUB_REPOSITORY
    core.setFailed = jest.fn()
    delete process.env.GITHUB_REPOSITORY
    const result = await dotGitHubRepo()
    expect(core.setFailed).toHaveBeenCalledWith(
      'This GitHub Actions environment does not have a valid context.',
    )
    expect(result).toBeUndefined()

    process.env.GITHUB_REPOSITORY = old_gh_repo
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

describe('org-rules.js Org Rules File applied', () => {
  let gh = undefined

  beforeAll(async () => {
    gh = await ghHandle()
  })

  // Reset inputs before each test
  beforeEach(() => {
    core.__resetInputsObject()
  })

  test('#applyOrgRules() -  org rules file, one rule, passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeTruthy()
  })

  test('#applyOrgRules() -  org rules file, one rule, fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeFalsy()
  })

  test('#applyOrgRules() -  org rules file, multiple complex rules, passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
  - name: "Anything belonging to the payments team must have sensitivity of critical."
    selection:
      team: payments
    requirements:
      tags:
        - data-sensitivity:critical
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: payments
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
tags: |
  - data-sensitivity: critical
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeTruthy()
  })

  test('#applyOrgRules() -  org rules file, multiple complex rules, fails (opsgenie missing)', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
  - name: "Anything belonging to the payments team must have sensitivity of critical."
    selection:
      team: payments
    requirements:
      tags:
        - data-sensitivity:critical
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: payments
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
tags: |
  - data-sensitivity:critical
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeFalsy()
  })

  test('#applyOrgRules() -  org rules file, multiple complex rules, fails (tag incorrect value)', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
  - name: "Anything belonging to the payments team must have sensitivity of critical."
    selection:
      team: payments
    requirements:
      tags:
        - data-sensitivity: critical
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: payments
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
tags: |
  - data-sensitivity:public
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeFalsy()
  })

  test('#applyOrgRules() -  org rules file, multiple complex rules, fails (tag missing)', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
  - name: "Anything belonging to the payments team must have sensitivity of critical."
    selection:
      team: payments
    requirements:
      tags:
        - data-sensitivity: critical
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: payments
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeFalsy()
  })

  test('#applyOrgRules() -  org rules file, multiple complex rules, passes (not payments team)', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
  - name: "Anything belonging to the payments team must have sensitivity of critical."
    selection:
      team: payments
    requirements:
      tags:
        - data-sensitivity: critical
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: reporting
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
tags: |
  - data-sensitivity:medium
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    const result = await applyOrgRules(serviceDefinition, ruleDefinition)
    expect(result).toBeTruthy()
  })
})
