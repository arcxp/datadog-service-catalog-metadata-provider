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

// This is our test subject
const { applyOrgRules } = require('../../lib/org-rules')

describe('org-rules.js', () => {
  test('#getOrgRules() - normal input', async () => {
    await applyOrgRules()
    expect(1).toBeTruthy()
  })
})
