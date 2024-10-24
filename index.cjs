const core = require('@actions/core')
const { HttpClient } = require('@actions/http-client')

const { DatadogPostGovernor } = require('./lib/governors')
const { inputsToRegistryDocument } = require('./lib/input-to-registry-document')
const { validateDatadogHostname } = require('./lib/input-validation')
const { fetchAndApplyOrgRules } = require('./lib/org-rules')

/**
 * This function takes the config JSON string and registers the service with
 * DataDog.
 * @param {string} config - The config JSON string.
 **/
const registerWithDataDog = async (apiKey, appKey, ddHost, configJsonStr) => {
  DatadogPostGovernor.increment()

  core.debug(`JSON: «${configJsonStr}»`)
  // Prep the auth
  const client = new HttpClient(
    'nodejs - GitHub Actions - arcxp/datadog-service-catalog-metadata-provider',
  )

  const response = await client.post(
    `https://${ddHost}/api/v2/services/definitions`,
    configJsonStr,
    {
      'DD-API-KEY': apiKey,
      'DD-APPLICATION-KEY': appKey,
      'Content-Type': 'application/json',
    },
  )
  const statusCode = response.message.statusCode
  const body = await response.readBody()
  core.debug(
    `Response status code: ${statusCode}, with body: ${body}\n`,
    response,
  )

  if (statusCode !== 200) {
    core.setFailed(
      `Failed to register service with DataDog. Status Code: ${statusCode} Body: ${body}`,
    )
  }
}

const run = async (configs) => {
  try {
    // Extract the API key for DataDog
    const apiKey = core.getInput('datadog-key')
    const appKey = core.getInput('datadog-app-key')

    // Initialize the Post governor to help prevent excessive calls to Datadog
    DatadogPostGovernor.init()

    if (!apiKey || !appKey) {
      return core.setFailed(
        'Both `datadog-key` and `datadog-app-key` are required.',
      )
    }

    // Fetch and verify the host.
    const ddHost = validateDatadogHostname(core.getInput('datadog-hostname'))

    // Verify the org config
    if (await fetchAndApplyOrgRules(configs)) {
      // Debug all of the info
      core.debug(`All of the configs: ${JSON.stringify(configs, undefined, 2)}`)

      // Register the service with DataDog
      await registerWithDataDog(apiKey, appKey, ddHost, JSON.stringify(configs))
    }
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

// Grab the inputs and then run with them!
core.debug('STARTING THE PARSE')
Promise.resolve()
  .then(() => inputsToRegistryDocument())
  .then((configs) => {
    core.debug(`Input schema version is «${core.getInput('schema-version')}»`)
    core.debug(
      `Inputs coming off of configs: ${JSON.stringify(configs, undefined, 2)}`,
    )

    return configs
  })
  .then((configs) => run(configs))
