const core = require('@actions/core')
const github = require('@actions/github')

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
    const config = core.getInput(inputName)
    return Object.assign(agg, { [inputName]: config })
  }, {})

  core.debug('All of the configs: ', JSON.stringify(configs, undefined, 2))
} catch (error) {
  console.error(error)
  core.setFailed(error.message)
}
