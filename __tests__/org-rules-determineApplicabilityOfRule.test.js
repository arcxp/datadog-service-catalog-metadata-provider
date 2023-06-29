// Seed these for GitHub's toolkit
const path = require('path')
process.env.GITHUB_EVENT_PATH = path.join(
  __dirname,
  '../data/github-context-payload.json',
)
process.env.GITHUB_REPOSITORY =
  'arcxp/datadog-service-catalog-metadata-provider'

const YAML = require('yaml')

// Pulling this in here activates the mocking of the github module
const github = require('@actions/github')

// Need to use inputs for some of our parameters
const core = require('@actions/core')

// This lets us get the inputs the way that they will actually come in.
const {
  inputsToRegistryDocument,
} = require('../lib/input-to-registry-document')
const {
  applyOrgRules,
  _test: {
    fetchRemoteRules,
    ghHandle,
    determineApplicabilityOfRule,
    determineRuleCompliance,
  },
} = require('../lib/org-rules')

describe('org-rules.js Org Rules selection', () => {
  afterAll(() => {
    core.setFailed.mockClear()
    core.getInput.mockClear()
  })
  test('#determineApplicabilityOfRule() - all', async () => {
    const ruleDefinition = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection: "all"
    requirements:
      links:
      - type: "runbook"
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
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineApplicabilityOfRule(ruleDefinition.rules[0], serviceDefinition),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - service-name', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      service-name: "false"
    requirements:
      links:
      - type: "runbook"
    `)
    const ruleDefinitionForTrue = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      service-name: "test1"
    requirements:
      links:
      - type: "runbook"
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
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForTrue.rules[0],
        serviceDefinition,
      ),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - team', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      team: "false"
    requirements:
      links:
      - type: "runbook"
    `)
    const ruleDefinitionForTrue = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      team: Team Name Here
    requirements:
      links:
      - type: "runbook"
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
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForTrue.rules[0],
        serviceDefinition,
      ),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - one tag', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      tags:
        intended-env: "dev"
    requirements:
      links:
      - type: "runbook"
    `)
    const ruleDefinitionForTrue = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      tags:
        intended-env: "prod"
    requirements:
      links:
      - type: "runbook"
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
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForTrue.rules[0],
        serviceDefinition,
      ),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - two tags', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      tags:
        intended-env: "dev"
        missing: missing
    requirements:
      links:
      - type: "runbook"
    `)
    const ruleDefinitionForTrue = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      tags:
        intended-env: "prod"
        lang: nodejs
    requirements:
      - links:
        - type: "runbook"
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
  - lang:nodejs
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForTrue.rules[0],
        serviceDefinition,
      ),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - combination tag and team', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      team: "hiya"
      tags:
        intended-env: "dev"
    requirements:
      links:
      - type: "runbook"
    `)
    const ruleDefinitionForTrue = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      team: "hiya"
      tags:
        intended-env: "prod"
    requirements:
      links:
      - type: "runbook"
    `)
    core.__setInputsObject(
      YAML.parse(`
---
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: hiya
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
repo: foo
tags: |
  - intended-env: prod
  - lang:nodejs
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()

    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
    expect(
      determineApplicabilityOfRule(
        ruleDefinitionForTrue.rules[0],
        serviceDefinition,
      ),
    ).toBeTruthy()
  })

  test('#determineApplicabilityOfRule() - check for missing tags', async () => {
    const ruleDefinitionForFalse = YAML.parse(`
---
org: test-org
rules:
  - name: "All services"
    selection:
      tags:
        intended-env: "dev"
        missing: missing
    requirements:
      links:
      - type: "runbook"
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
      determineApplicabilityOfRule(
        ruleDefinitionForFalse.rules[0],
        serviceDefinition,
      ),
    ).toBeFalsy()
  })
})
