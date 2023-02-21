const YAML = require('yaml')
const core = require('@actions/core')
const github = require('@actions/github')
const ghRestPlugin = require('@octokit/rest')
const _ = require('lodash')

/**
 * The default name of the service catalog rules file in the `.github` repository.
 * @type {string}
 * @private
 * @constant
 */
const DEFAULT_RULES_NAME = 'service-catalog-rules.yml'

/**
 * Fetch the GitHub token from the environment, and return an authenticated
 * Octokit instance.
 * @param {string} token - The GitHub token to use for authentication, otherwise the GITHUB_TOKEN from the environment will be used.
 * @returns {Octokit} - An authenticated Octokit instance.
 * @private
 * @function
 */
const ghHandle = async (token = undefined) =>
  Promise.resolve()
    .then(
      () =>
        token || core.getInput('github-token') || process.env['GITHUB_TOKEN'],
    )
    .then((token) =>
      !!token && token.length > 0
        ? github.getOctokit(token, {})
        : core.setFailed('No GitHub token found.'),
    )

/**
 * Fetch the current organization from the GitHub context.
 * @param {Octokit} gh - An authenticated Octokit instance (default is the GITHUB_TOKEN from the environment).
 * @returns {string} - The current organization.
 * @private
 * @function
 */
const currentOrg = async (gh = undefined) =>
  Promise.resolve()
    .then(() => gh || ghHandle())
    .then(
      (ghub) =>
        github.context.repo?.owner ||
        Promise.reject(
          'This GitHub Actions environment does not have a valid context.',
        ),
    )
    .catch((err) => core.setFailed(err))

const dotGitHubRepo = async (gh = undefined) =>
  `${await currentOrg(gh || (await ghHandle()))}/.github`

const fetchRemoteRules = async (
  gh = undefined,
  rulesFileName = DEFAULT_RULES_NAME,
) => {
  try {
    const octokit = gh ?? (await ghHandle())
    const orgName = await currentOrg(octokit)
    const defaultPayload = { org: orgName || 'UNKNOWN', rules: [] }

    if (!orgName) {
      core.warning('Unable to determine current organization or owner.')
      return defaultPayload
    }

    const { data } = await octokit.rest.repos
      .getContent({
        owner: orgName,
        repo: '.github',
        path: rulesFileName,
      })
      .then((res) => (res?.data ? res : { data: undefined }))
      .catch((err) => {
        return Promise.resolve({ data: undefined })
      })
    if (!data) {
      return defaultPayload
    }

    const orgRulesFileContents = YAML.parse(
      decodeURIComponent(
        Buffer.from(data.content, data.encoding ?? 'base64').toString(),
      ),
    )

    if (!orgRulesFileContents || typeof orgRulesFileContents !== 'object') {
      return core.setFailed(
        `Org Rules File "${rulesFileName}" failed to parse.`,
      )
    }

    // console.debug(
      // 'Rules file: ',
      // orgRulesFileContents,
      // typeof orgRulesFileContents,
      // JSON.stringify(orgRulesFileContents, undefined, 2),
    // )

    if (orgRulesFileContents?.org !== orgName) {
      return core.setFailed(
        `Org ${orgName} does not match rules file org. The org in the rules file must match the GitHub organization slug.`,
      )
    }

    return orgRulesFileContents || defaultPayload
  } catch (err) {
    return core.setFailed('Error fetching remote rules: ' + err.toString())
  }

  core.warning("Somehow we got here, but we shouldn't have.")
  return { org: 'UNKNOWN', rules: [] }
}

const determineApplicabilityOfRule = (rule, serviceDescription) => {
  const selectionCriteria = rule?.selection || undefined
  const selectableFields = ['links', 'tags', 'service-name', 'team']

  if (!selectionCriteria) return false

  if (`${selectionCriteria}`.toLocaleLowerCase() === 'all') return true

  if (Array.isArray(selectionCriteria)) {
    const applicableCriteria = selectionCriteria.find((criteria) => {
      // const keysToCheck = Object.keys(criteria)
      // const matches =
    })
  }
}

/**
 * Apply the organization rules to the service description to be sent to Datadog.
 * @param {object} serviceDescription - The service description to be sent to Datadog.
 * @returns {void} - Nothing.
 * @public
 * @function
 * @throws {Error} - If the Datadog host is invalid.
 */
const applyOrgRules = async (serviceDescription) => {
  const gh = await ghHandle()
  const orgRulesFile = core.getInput('org-rules-file') || DEFAULT_RULES_NAME

  // Fetch the org rules file.
  const remoteOrgRules = await fetchRemoteRules(gh, orgRulesFile)

  return
}

module.exports = {
  applyOrgRules,
}

// Expose some of the private functions for testing.
if (process.env['JEST_WORKER_ID']) {
  module.exports._test = {
    fetchRemoteRules,
    dotGitHubRepo,
    currentOrg,
    ghHandle,
    DEFAULT_RULES_NAME,
  }
}