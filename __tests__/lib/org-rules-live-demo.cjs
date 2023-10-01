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

describe('fetchAndApplyOrgRules()', () => {
  test('#fetchAndApplyOrgRules() -  working file', async () => {
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
  - internet_accessible: "false"
integrations: |
  opsgenie:
    service_url: https://example.com
    region: US
    `),
    )
    const serviceDefinition = await inputsToRegistryDocument()
    const result = await fetchAndApplyOrgRules(serviceDefinition)
    expect(result).toBeTruthy()
  })
})
