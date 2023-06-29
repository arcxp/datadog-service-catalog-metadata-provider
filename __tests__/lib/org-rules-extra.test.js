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
} = require('../../lib/input-to-registry-document')
const {
  applyOrgRules,
  _test: {
    fetchRemoteRules,
    ghHandle,
    determineApplicabilityOfRule,
    determineRuleCompliance,
  },
} = require('../../lib/org-rules')

describe.each([
  {
    name: 'application',
    orgRules: `
---

org: test-org
rules:
  - name: "All services"
    selection:
      schema-version: v2.1
    requirements:
      application: any
`,
    tests: [
      {
        type: 'selection',
        inputs: `
---

schema-version: v2
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: false,
      },
      {
        type: 'selection',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
application: test-app
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: true,
      },
      {
        type: 'compliance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
application: test-app
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: true,
      },
      {
        type: 'compliance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: false,
      },
    ],
  },
  {
    name: 'tier',
    orgRules: `
---

org: test-org
rules:
  - name: "All services"
    selection:
      schema-version: v2.1
    requirements:
      tier:
        - p0
        - p1
        - p2
        - p3
`,
    tests: [
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
tier: p1
`,
        expected: true,
      },
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
tier: horse
`,
        expected: false,
      },
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: false,
      },
    ],
  },
  {
    name: 'lifecycle',
    orgRules: `
---

org: test-org
rules:
  - name: "All services"
    selection:
      schema-version: v2.1
    requirements:
      lifecycle:
        - dev
        - staging
        - beta
        - production
        - retired
`,
    tests: [
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
lifecycle: production
`,
        expected: true,
      },
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: false,
      },
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
lifecycle: chicken
`,
        expected: false,
      },
    ],
  },
  {
    name: 'description',
    orgRules: `
---

org: test-org
rules:
  - name: "All services"
    selection:
      schema-version: v2.1
    requirements:
      description: any
`,
    tests: [
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
description: testing
`,
        expected: true,
      },
      {
        type: 'compilance',
        inputs: `
---

schema-version: v2.1
datadog-key: FAKE_KEY
datadog-app-key: FAKE_KEY
service-name: test1
team: Team Name Here
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
`,
        expected: false,
      },
    ],
  },
])('determineApplicabilityOfRule() - $name', ({ name, orgRules, tests }) => {
  beforeEach(() => {
    console.warn = jest.fn() // Remove this for debugging details
    core.setFailed.mockClear()
    core.getInput.mockClear()
  })

  const ruleDefinition = YAML.parse(orgRules)

  test.each(tests)(`${name} - $type`, async ({ type, inputs, expected }) => {
    core.__setInputsObject(YAML.parse(inputs))
    const serviceDefinition = await inputsToRegistryDocument()

    const func =
      type === 'selection'
        ? determineApplicabilityOfRule
        : determineRuleCompliance

    expect(func(ruleDefinition.rules[0], serviceDefinition)).toEqual(expected)
  })
})
