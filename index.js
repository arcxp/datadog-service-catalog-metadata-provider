const core = require('@actions/core')
const github = require('@actions/github')
const YAML = require('yaml')
const { HttpClient } = require('@actions/http-client')

/**
 * This function takes inputs encoded as strings and expands them to
 * the full array of objects.
 * @param {string} str - The input value.
 * @returns {Object} The input value with all object inputs expanded.
 **/
const expandObjectInputs = (str) => {
  try {
    return YAML.parse(str)
  } catch (error) {
    core.debug(`Input as <<${str}>> is not a valid YAML object.`)
    core.error(error)
    core.setFailed(error.message)
  }
}

/**
 * This function takes the config JSON string and registers the service with
 * DataDog.
 * @param {string} config - The config JSON string.
 **/
const registerWithDataDog = async (apiKey, appKey, configJsonStr) => {
  core.debug(`JSON: ${configJsonStr}`)
  // Prep the auth
  const client = new HttpClient(
    'nodejs - GitHub Actions - arcxp/datadog-service-catalog-metadata-provider',
  )

  const response = await client.post(
    'https://api.datadoghq.com/api/v2/services/definitions',
    configJsonStr,
    {
      'DD-API-KEY': apiKey,
      'DD-APPLICATION-KEY': appKey,
      'Content-Type': 'application/json',
    },
  )
  const statusCode = response.message.statusCode
  const body = await response.readBody()
  core.debug(`Response status code: ${statusCode}, with body: ${body}`)

  if (statusCode !== 200) {
    core.setFailed(
      `Failed to register service with DataDog. Status Code: ${statusCode} Body: ${body}`,
    )
  }
}

const run = async () => {
  try {
    const configs = [
      'team',
      'contacts',
      'repos',
      'tags',
      'links',
      'docs',
    ].reduce((agg, inputName) => {
      const inputValue = core.getInput(inputName)
      return Object.assign(agg, { [inputName]: expandObjectInputs(inputValue) })
    }, {})

    // Prep the team email contact
    const teamContactEmail = {
      name: 'Team Email',
      type: 'email',
      contact: core.getInput('email'),
    }
    const teamContactSlack = {
      name: 'Support Slack Channel',
      type: 'slack',
      contact: core.getInput('slack-support-channel'),
    }
    configs.contacts = Array.isArray(configs.contacts)
      ? [teamContactEmail, teamContactSlack, ...configs.contacts]
      : [teamContactEmail, teamContactSlack]

    if (core.getInput('repo')) {
      const serviceRepo = {
        name: 'Service Repository',
        provider: 'Github',
        url: core.getInput('repo'),
      }
      configs.repos = Array.isArray(configs.repos)
        ? [serviceRepo, ...configs.repos]
        : [serviceRepo]
    } else {
      configs.repos = Array.isArray(configs.repos) ? configs.repos : []
    }

    // Make sure we have at least one repository.
    if (configs.repos.length === 0) {
      return core.setFailed('No repos provided. At least one repo is required.')
    }

    // Rename `service-name` to `dd-service`
    configs['dd-service'] = core.getInput('service-name')
    configs['schema-version'] = 'v2'

    // These items don't have any convenience items, but they _must_ be arrays.
    configs.tags = Array.isArray(configs.tags) ? configs.tags : []
    configs.docs = Array.isArray(configs.docs) ? configs.docs : []
    configs.links = Array.isArray(configs.links) ? configs.links : []

    // Extract the API key for DataDog
    const apiKey = core.getInput('datadog-key')
    const appKey = core.getInput('datadog-app-key')

    // Debug all of the info
    core.debug(`All of the configs: ${JSON.stringify(configs, undefined, 2)}`)

    // Register the service with DataDog
    await registerWithDataDog(apiKey, appKey, JSON.stringify(configs))
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

run()
