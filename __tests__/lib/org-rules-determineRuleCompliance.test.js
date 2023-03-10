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

// This is our test subject
const {
  applyOrgRules,
  _test: {
    fetchRemoteRules,
    ghHandle,
    currentOrg,
    dotGitHubRepo,
    determineApplicabilityOfRule,
    determineRuleCompliance,
  },
} = require('../../lib/org-rules')

process.env.GITHUB_EVENT_PATH = path.join(
  __dirname,
  '../data/github-context-payload.json',
)
process.env.GITHUB_REPOSITORY =
  'arcxp/datadog-service-catalog-metadata-provider'

describe('org-rules.js Org Rules application', () => {
  test('#determineRuleCompliance() - tags ANY passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      tags:
      - intended-env: ANY
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
tags: |
  - intended-env: prod
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - tag ANY fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      tags:
      - intended-env: ANY
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - tags value in list passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      tags:
      - intended-env:
        - prod
        - staging
        - dev
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
tags: |
  - intended-env: prod
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - links.type passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        type: runbook
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - links.type passes, two links', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        type: runbook
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
  - name: Test Wiki
    url: https://example.com
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - links.count passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        count: 1
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - links.count and links.type passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        type: runbook
        count: 2
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
  - name: Something completely different
    url: https://example.com/foo
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - links.type fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        type: runbook
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
links: |
  - name: Test Wiki
    url: https://example.com
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - links.count fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        count: 2
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - links.count and links.type fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      links:
        type: runbook
        count: 2
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
links: |
  - name: Test Runbook
    url: https://example.com
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - docs count pass', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      docs:
        count: 1
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
docs: |
  - name: Test Runbook
    url: https://example.com
    provider: confluence
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - docs count fail', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      docs:
        count: 1
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - contacts.type passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        type: email
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
contacts: |
  - name: Test Runbook
    value: foo@fakeemaildomain.com
    type: email
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - contacts.type passes, two contacts', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        type: slack
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
contacts: |
  - name: Test Runbook
    value: foo@fakeemaildomain.com
    type: email
  - name: Slack
    value: https://slack.com/blah/blahblah
    type: slack
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - contacts.count passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        count: 1
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
contacts: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - contacts.count and contacts.type passes', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        type: runbook
        count: 2
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
contacts: |
  - name: Test Runbook
    url: https://example.com
    type: runbook
  - name: Something completely different
    url: https://example.com/foo
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - contacts.type fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        type: runbook
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
contacts: |
  - name: Test Wiki
    url: https://example.com
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - contacts.count fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        count: 3
    `)

    // The `email` is a required field, and counts as a contact, so we're gonna bump up to 3
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
contacts: |
  - name: Test Runbook
    url: https://slack.com/blah/blahblah
    type: slack
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - contacts.count and contacts.type fails', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      contacts:
        type: runbook
        count: 2
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
contacts: |
  - name: Test Runbook
    url: https://example.com
    type: wiki
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  //--------------------------------------------------------------------------------

  test('#determineRuleCompliance() - repos count pass', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      repos:
        count: 2
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
repos: |
  - name: Test Repo
    url: https://example.com
    provider: github
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - repos count pass (shortcut only, no supplemental)', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      repos:
        count: 1
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - repos count fail', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      repos:
        count: 2
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - opsgenie pass', async () => {
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - pagerduty pass', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - pagerduty
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
  pagerduty:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - opsgenie and pagerduty pass', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
        - pagerduty
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
  pagerduty: https://example.com
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineRuleCompliance() - opsgenie fail', async () => {
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - pagerduty fail', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - pagerduty
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - opsgenie and pagerduty (missing) fail', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
        - pagerduty
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

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })

  test('#determineRuleCompliance() - opsgenie (missing) and pagerduty fail', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: all
    requirements:
      integrations:
        - opsgenie
        - pagerduty
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
  pagerduty: https://example.com
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineRuleCompliance(ruleDefinition.rules[0], serviceDefinition),
    ).toBeFalsy()
  })
})
