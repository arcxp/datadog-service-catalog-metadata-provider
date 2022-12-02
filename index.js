const core = require('@actions/core')
const github = require('@actions/github')
const YAML = require('yaml')

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

try {
  const configs = [
    'datadog-key',
    'service-name',
    'team',
    'email',
    'slack-support-channel',
    'repo',
    'contacts',
    'repos',
    'tags',
    'links',
    'docs',
  ].reduce((agg, inputName) => {
    const inputValue = core.getInput(inputName)
    return Object.assign(agg, { [inputName]: expandObjectInputs(inputValue) })
  }, {})

  core.debug(`All of the configs: ${JSON.stringify(configs, undefined, 2)}`)
} catch (error) {
  console.error(error)
  core.setFailed(error.message)
}
