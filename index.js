const core = require('@actions/core')
const github = require('@actions/github')
const YAML = require('yaml')
const { HttpClient } = require('@actions/http-client')

const { inputsToRegistryDocument } = require('./lib/input-to-registry-document')

/**
 * This function takes the config JSON string and registers the service with
 * DataDog.
 * @param {string} config - The config JSON string.
 **/
const registerWithDataDog = async (apiKey, appKey, ddHost, configJsonStr) => {
  core.debug(`JSON: ${configJsonStr}`)
  // Prep the auth
  const client = new HttpClient(
    'nodejs - GitHub Actions - arcxp/datadog-service-catalog-metadata-provider',
  )

  const response = await client.post(
    `https://${ddHost}/api/v2/services/definitions`,
    configJsonStr,
    {
      'DD-API-KEY': apiKey,
      // 'DD-APPLICATION-KEY': appKey,
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

const run = async (configs) => {
  try {
    // Extract the API key for DataDog
    const apiKey = core.getInput('datadog-key')
    const appKey = core.getInput('datadog-app-key')
    if (!apiKey || !appKey) {
      return core.setFailed(
        'Both `datadog-key` and `datadog-app-key` are required.',
      )
    }

    // Fetch and verify the host.
    const ddHost = core.getInput('datadog-hostname')
    if (!ddHost || !ddHost.match(/^[a-z0-9.-]+\.datadoghq\.(com|eu|us)$/)) {
      return core.setFailed(
        `Invalid DataDog host: ${ddHost}. See here for more details: https://docs.datadoghq.com/getting_started/site/`,
      )
    }

    // Debug all of the info
    core.debug(`All of the configs: ${JSON.stringify(configs, undefined, 2)}`)

    // Register the service with DataDog
    await registerWithDataDog(apiKey, appKey, ddHost, JSON.stringify(configs))
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

if (require.main === module) {
  run(inputsToRegistryDocument())
}
