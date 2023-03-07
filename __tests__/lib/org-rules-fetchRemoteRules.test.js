// Seed these for GitHub's toolkit
const path = require('path')

const YAML = require('yaml')

// Pulling this in here activates the mocking of the github module
const github = require('@actions/github')

// Need to use inputs for some of our parameters
const core = require('@actions/core')

const {
  applyOrgRules,
  _test: {
    fetchRemoteRules,
    ghHandle,
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

describe('org-rules.js Org Rules File acquisition', () => {
  let gh = undefined

  beforeAll(async () => {
    gh = await ghHandle()
  })

  // Reset inputs before each test
  beforeEach(() => {
    core.__resetInputsObject()
  })

  test('#fetchRemoteRules() - default case: no org rules file', async () => {
    const result = await fetchRemoteRules(
      gh,
      'org-rule-test-file-not-found.yml',
    )
    expect(result).toMatchObject({
      org: 'arcxp',
      rules: expect.arrayContaining([]),
    })
  })

  test('#fetchRemoteRules() - default case: has org rules file', async () => {
    const result = await fetchRemoteRules(gh)
    expect(result).toMatchObject({
      org: 'arcxp',
      rules: expect.arrayContaining([]),
    })
    // Yay for snapshot testing!
    expect(result).toMatchSnapshot()
  })

  test('#fetchRemoteRules() - exception case: failed to parse', async () => {
    const orig_core_setFailed = core.setFailed
    core.setFailed = jest.fn()
    const result = await fetchRemoteRules(
      gh,
      'broken-service-catalog-rules.yml',
    )
    expect(core.setFailed).toBeCalledTimes(1)
    expect(core.setFailed).toBeCalledWith(
      'Org Rules File "broken-service-catalog-rules.yml" failed to parse.',
    )
    expect(result).toBeUndefined()
    core.setFailed = orig_core_setFailed
  })

  test('#fetchRemoteRules() - no discernable org', async () => {
    const old_gh_repo = process.env.GITHUB_REPOSITORY
    delete process.env.GITHUB_REPOSITORY
    core.setFailed = jest.fn()
    const result = await fetchRemoteRules()
    expect(core.setFailed).toBeCalledTimes(1)
    expect(core.setFailed).toHaveBeenCalledWith(
      'This GitHub Actions environment does not have a valid context.',
    )
    expect(result).toMatchObject({ org: 'UNKNOWN', rules: [] })

    process.env.GITHUB_REPOSITORY = old_gh_repo
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
