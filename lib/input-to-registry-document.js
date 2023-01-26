const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
const { expandObjectInputs } = require('./input-expander')

/**
 * This function takes an input and forces it to be an array.
 * @param {any} input - The input to force into an array.
 * @returns {array} - The input as an array.
 * @private
 * @function
 */
const forceArray = (input) => (Array.isArray(input) ? input : [input])

/**
 * This function takes an input and forces it to be an object.
 * @param {any} input - The input to force into an object.
 * @returns {object} - The input as an object.
 * @private
 * @function
 */
const forceObject = (input) => (typeof input === 'object' ? input : {})

/**
 * This function takes the inputs from the Action and converts them into a registry document for Datadog.
 * @returns {object} - The registry document.
 * @public
 * @function
 */
const inputsToRegistryDocument = async () => {
  // This does the initial fetch of configs from the Action inputs.
  const configs = [
    'team',
    'contacts',
    'repos',
    'tags',
    'links',
    'docs',
    'integrations',
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
    configs.repos = forceArray(configs.repos)
  }

  // Make sure we have at least one repository.
  if (configs.repos?.length === 0) {
    return core.setFailed('No repos provided. At least one repo is required.')
  }

  // Rename `service-name` to `dd-service`
  configs['dd-service'] = core.getInput('service-name')
  // The schema version
  configs['schema-version'] = 'v2'

  // These items don't have any convenience items, but they _must_ be arrays.
  configs.tags = forceArray(configs.tags)
  configs.docs = forceArray(configs.docs)
  configs.links = forceArray(configs.links)
  // Except for this one which must be an Object
  configs.integrations = forceObject(configs.integrations)

  // Return the configs.
  return configs
}

module.exports = { inputsToRegistryDocument }
