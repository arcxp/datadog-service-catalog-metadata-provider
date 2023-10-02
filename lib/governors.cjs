const core = require('@actions/core')

const DatadogPostGovernor = {
  state: undefined,
  limit: undefined,
  init: (limit = 10) => {
    DatadogPostGovernor.limit = limit
    DatadogPostGovernor.state = 0
  },
  increment: () => {
    if (DatadogPostGovernor.state >= DatadogPostGovernor.limit) {
      return core.setFailed(`Rate limit reached. Please do not exceed ${DatadogPostGovernor.limit} calls to Datadog in a single action.`)
    }
    DatadogPostGovernor.state += 1
  },
}

module.exports = {
  DatadogPostGovernor
}
