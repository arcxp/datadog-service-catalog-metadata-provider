// Seed these for GitHub's toolkit
const path = require('path')
process.env.GITHUB_EVENT_PATH = path.join(
  __dirname,
  '../data/github-context-payload.json',
)
process.env.GITHUB_REPOSITORY =
  'arcxp/datadog-service-catalog-metadata-provider'

// Pulling this in here activates the mocking of the github module
const github = require('@actions/github')

// Need to use inputs for some of our parameters
const core = require('@actions/core')

// This is our test subject
const { applyOrgRules } = require('../../lib/org-rules')

describe('org-rules.js', () => {
  // Reset inputs before each test
  beforeEach(() => {
    core.__resetInputsObject()
  })

  test('#getOrgRules() - default case: no org rules file', async () => {
    core.__setInputsObject({
      'org-rules-file': 'org-rule-test-file-not-found.yml',
    })
    expect(await applyOrgRules({})).resolves
  })

  test('#getOrgRules() - default case: has org rules file', async () => {
    expect(await applyOrgRules({})).resolves
  })
})
