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
    return !agg[inputName] ? Object.assign(agg, { [inputName]: config }) : agg
  }, {})

  core.info('All of the configs:', configs)
} catch (error) {
  console.error(error)
  core.setFailed(error.message)
}
