const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The default name of the service catalog rules file in the `.github` repository.
 * @type {string}
 * @private
 * @constant
 */
const DEFAULT_CONFIG_NAME = 'service-catalog-rules.yml'

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
    .then((token) => {
      console.log('token', token)
      return token
    })
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
    .then((ghub) => {
      console.log(ghub.context)
      return ghub
    })
    .then((ghub) => ghub.context.repo.owner)
    .catch((err) => core.setFailed(err))

const dotGitHubRepo = async (gh = undefined) =>
  `${await currentOrg(gh || (await ghHandle()))}/.github`

const fetchRemoteConfig = async (
  gh = undefined,
  configName = DEFAULT_CONFIG_NAME,
) => {
  const octokit = gh || (await ghHandle())
  const { data } = await octokit.rest.repos.getContent({
    owner: await currentOrg(octokit),
    repo: '.github',
    path: configName,
  })
  core.debug(Buffer.from(data.content, 'base64').toString())
}

/**
 * Apply the organization rules to the configs to be sent to Datadog.
 * @param {object} configs - The configs to be sent to Datadog.
 * @returns {void} - Nothing.
 * @public
 * @function
 * @throws {Error} - If the Datadog host is invalid.
 * TODO: I'll need to make it so that you can supply a custom token at some point.
 */
const applyOrgRules = async (configs) => {
  const gh = await ghHandle()

  // Fetch the remote config file.
  const remoteConfig = await fetchRemoteConfig(gh)
}

module.exports = {
  applyOrgRules,
  _test: { dotGitHubRepo, currentOrg, ghHandle },
}
