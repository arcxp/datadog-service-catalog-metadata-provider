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
const {
  applyOrgRules,
  _test: { fetchRemoteRules, ghHandle },
} = require('../../lib/org-rules')

describe('org-rules.js', () => {
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
    core.setFailed = jest.fn((x) => console.debug('SETFAILED CALLED: ', x))
    const result = await fetchRemoteRules(
      gh,
      'broken-service-catalog-rules.yml',
    )
    expect(core.setFailed).toBeCalledTimes(1)
    expect(core.setFailed).toBeCalledWith(
      'Org Rules File "broken-service-catalog-rules.yml" failed to parse.',
    )
    expect(result).toBeUndefined()
  })
})
