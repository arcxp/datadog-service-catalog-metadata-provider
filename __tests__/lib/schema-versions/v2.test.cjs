const YAML = require('yaml')
const core = require('@actions/core')
const subject = require('../../../lib/schema-versions/v2.cjs')

describe('lib/schema-versions/v2.cjs#mapSchemaFields()', () => {
  test('#mapSchemaFields() - Full schema fields set', () => {
    const testInput = `
---
schema-version: something-crazy-that-is-ignored
service-name: schema-versions-v2-test
team: Team Name Here
tags: |
  - 'application:GitHub Action Config Test'
  - env:prod
  - infrastructure:serverless
  - language:nodejs
  - other :   value
repos: |
  - url: https://github.com/actions/toolkit
    provider: Github
    name: "@actions/toolkit"
links: |
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
docs: |
  - name: GitHub Actions!
    url: https://github.com/features/actions
    provider: Github
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
  pagerduty: https://my-org.pagerduty.com/service-directory/PMyService
contacts: |
  - name: DBA Team Email Alias
    type: email
    contact: dba-team-name-here@fakeemaildomainthatdoesntexist.com
extensions: |
  - name: foo
    bar: bar
 `
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject._test.mapSchemaFields(core)
    expect(inputs).toMatchSnapshot()
    expect(inputs['dd-service']).toEqual('schema-versions-v2-test')
  })

  test('#mapSchemaFields() - Partial schema fields set', () => {
    const testInput = `
---
schema-version: something-crazy-that-is-ignored
team: Team Name Here
tags: |
  - 'application:GitHub Action Config Test'
  - env:prod
  - infrastructure:serverless
  - language:nodejs
  - other :   value
repos: |
  - url: https://github.com/actions/toolkit
    provider: Github
    name: "@actions/toolkit"
links: |
  - name: AMI Version Status Dashboard
    url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/dashboard
    type: dashboard
docs: |
  - name: GitHub Actions!
    url: https://github.com/features/actions
    provider: Github
integrations: |
  opsgenie:
    service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
    region: US
  pagerduty: https://my-org.pagerduty.com/service-directory/PMyService
contacts: |
  - name: DBA Team Email Alias
    type: email
    contact: dba-team-name-here@fakeemaildomainthatdoesntexist.com
extensions: |
  - name: foo
    bar: bar
 `
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject._test.mapSchemaFields(core)
    expect(inputs).toMatchSnapshot()
    expect(inputs['dd-service']).toBeUndefined()
  })
})

describe('lib/schema-versions/v2.cjs#mapInputs()', () => {
  test('#mapInputs() - Merging in some convenience fields', () => {
    const testInput = `
---
schema-version: something-crazy-that-is-ignored
team: Team Name Here
email: atotallydifferentemail@fakeemaildomainthatdoesntexist.com
slack: 'https://fakeorg.slack.com/archives/A0000000000'
slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000001'
repo: https://github.com/arcxp/datadog-service-catalog-metadata-provider
tags: |
  - 'application:GitHub Action Config Test'
contacts: |
  - name: DBA Team Email Alias
    type: email
    contact: dba-team-name-here@fakeemaildomainthatdoesntexist.com
pagerduty: https://my-org.pagerduty.com/service-directory/PMyService
opsgenie: https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000
extensions: |
  - name: foo
    bar: bar
 `
    // Full set of fields
    core.__setInputsObject(YAML.parse(testInput))
    const inputs = subject.mapInputs(core)
    expect(inputs).toMatchSnapshot()
    expect(inputs.contacts).toEqual([
      {
        contact: 'dba-team-name-here@fakeemaildomainthatdoesntexist.com',
        name: 'DBA Team Email Alias',
        type: 'email',
      },
      {
        contact: 'atotallydifferentemail@fakeemaildomainthatdoesntexist.com',
        name: 'Primary Email',
        type: 'email',
      },
      {
        name: 'Primary Slack Channel',
        contact: 'https://fakeorg.slack.com/archives/A0000000000',
        type: 'slack',
      },
      {
        name: 'Support Channel',
        contact: 'https://fakeorg.slack.com/archives/A0000000001',
        type: 'slack',
      },
    ])

    expect(inputs.repos).toEqual([
      {
        url: 'https://github.com/arcxp/datadog-service-catalog-metadata-provider',
        name: 'Primary Repository',
      },
    ])

    expect(inputs.integrations).toEqual({
      pagerduty: 'https://my-org.pagerduty.com/service-directory/PMyService',
      opsgenie: {
        'service-url':
          'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
      },
    })
  })
})
