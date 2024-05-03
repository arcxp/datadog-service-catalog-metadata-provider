const YAML = require('yaml')
const core = require('@actions/core')
const subject = require('../../lib/convenience-mappings.cjs')

describe('lib/convenience-mappings.cjs', () => {
  test('#getConvenienceFieldValues() - full set', () => {
    const testInput = `
---
email: 'team-name-here@fakeemaildomainthatdoesntexist.com'
slack: 'https://fakeorg.slack.com/archives/A0000000000'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000001'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
`
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject.getConvenienceFieldValues(core)
    expect(inputs).toMatchSnapshot()
    expect(inputs.email).toEqual(
      'team-name-here@fakeemaildomainthatdoesntexist.com',
    )
  })

  test('#getConvenienceFieldValues() - partial set', () => {
    const testInput = `
---
slack: 'https://fakeorg.slack.com/archives/A0000000000'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000001'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
`
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject.getConvenienceFieldValues(core)
    expect(inputs).toMatchSnapshot()
    expect(inputs.email).toBeUndefined()
  })

  test('#getConvenienceFieldValues() - partial set', () => {
    const testInput = `
---
slack: 'https://fakeorg.slack.com/archives/A0000000000'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000001'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
`
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject.getConvenienceFieldValues(core, {
      repo: 'OVERRIDE!',
    })
    expect(inputs).toMatchSnapshot()
    expect(inputs.repo).toEqual('OVERRIDE!')
  })
})
