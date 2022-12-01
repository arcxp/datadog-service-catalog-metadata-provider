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
  ].reduce((value) => {
    const config = core.getInput(value)
    return config ? { ...configs, [value]: config } : configs
  }, {})

  core.info('All of the configs:', configs)
} catch (error) {
  core.setFailed(error.message)
}
