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

  test('#currentOrg() - no value', async () => {
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

  test('#dotGitHubRepo() - no value', async () => {
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

  test.skip('#applyOrgRules() - default case: no org rules file', async () => {
    const result = await applyOrgRules(gh, 'org-rule-test-file-not-found.yml')
    expect(result).toMatchObject({
      org: 'arcxp',
      rules: expect.arrayContaining([]),
    })
  })
})