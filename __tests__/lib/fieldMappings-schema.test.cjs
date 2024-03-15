/**
 * @fileoverview This test covers all of the field mappings across versions.
 * @jest-environment node
 * @group ci
 * @author Mike Stemle <hello@mikestemle.com>
 **/

const core = require('@actions/core')
const {
  mappings,
  convenienceFields,
  schemaFields,
  mapField,
} = require('../../lib/fieldMappings')

describe.each([
  {
    version: 'v2',
    field: 'schema-version',
    input: 'v2',
    value: { 'schema-version': 'v2' },
  },
  {
    version: 'v2.1',
    field: 'schema-version',
    input: 'v2.1',
    value: { 'schema-version': 'v2.1' },
  },
  {
    version: 'v2',
    field: 'service-name',
    input: 'test-service',
    value: { 'dd-service': 'test-service' },
  },
  {
    version: 'v2.1',
    field: 'service-name',
    input: 'test-service',
    value: { 'dd-service': 'test-service' },
  },
  {
    version: 'v2',
    field: 'team',
    input: 'app-team-name',
    value: { team: 'app-team-name' },
  },
  {
    version: 'v2.1',
    field: 'team',
    input: 'app-team-name',
    value: { team: 'app-team-name' },
  },
  {
    version: 'v2',
    field: 'contacts',
    input: `
- name: Testy McTester
  type: email
  contact: testy@mctester.com
`,
    value: {
      contacts: [
        {
          name: 'Testy McTester',
          type: 'email',
          contact: 'testy@mctester.com',
        },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'contacts',
    input: `
- name: Testy McTester
  type: email
  contact: testy@mctester.com
`,
    value: {
      contacts: [
        {
          name: 'Testy McTester',
          type: 'email',
          contact: 'testy@mctester.com',
        },
      ],
    },
  },
  {
    version: 'v2',
    field: 'tags',
    input: `
- plain:nospaces
- compat1: space-in-value
- compat2 : space-in-both
- number_value : 42
`,
    value: {
      tags: [
        'plain:nospaces',
        'compat1:space-in-value',
        'compat2:space-in-both',
        'number_value:42',
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'tags',
    input: `
- plain:nospaces
- compat1: space-in-value
- compat2 : space-in-both
`,
    value: {
      tags: [
        'plain:nospaces',
        'compat1:space-in-value',
        'compat2:space-in-both',
      ],
    },
  },
  {
    version: 'v2',
    field: 'links',
    input: `
- name: 'first-link'
  type: url
  url: https://manchicken.io/testing
`,
    value: {
      links: [
        {
          name: 'first-link',
          type: 'url',
          url: 'https://manchicken.io/testing',
        },
      ],
    },
  },
  {
    version: 'v2',
    field: 'links',
    input: `
- name: 'first-link'
  type: url
  url: https://manchicken.io/testing
  provider: Website
`,
    value: {
      links: [
        {
          name: 'first-link',
          type: 'url',
          url: 'https://manchicken.io/testing',
        },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'links',
    input: `
- name: 'first-link'
  type: url
  url: https://manchicken.io/testing
  provider: Website
`,
    value: {
      links: [
        {
          name: 'first-link',
          type: 'url',
          url: 'https://manchicken.io/testing',
          provider: 'Website',
        },
      ],
    },
  },
  {
    version: 'v2',
    field: 'integrations',
    input: `
pagerduty: "https://my-org.pagerduty.com/service-directory/PMyService"
`,
    value: {
      integrations: {
        pagerduty: 'https://my-org.pagerduty.com/service-directory/PMyService',
      },
    },
  },
  {
    version: 'v2',
    field: 'integrations',
    input: `
opsgenie:
  service-url: "https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000"
  region: US
`,
    value: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
          region: 'US',
        },
      },
    },
  },
  {
    version: 'v2.1',
    field: 'integrations',
    input: `
pagerduty:
  service-url: "https://my-org.pagerduty.com/service-directory/PMyService"
`,
    value: {
      integrations: {
        pagerduty: {
          'service-url':
            'https://my-org.pagerduty.com/service-directory/PMyService',
        },
      },
    },
  },
  {
    version: 'v2.1',
    field: 'integrations',
    input: `
opsgenie:
  service-url: "https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000"
  region: US
`,
    value: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
          region: 'US',
        },
      },
    },
  },
  {
    version: 'v2',
    field: 'application',
    input: 'app-name',
    value: {
      error:
        'Sorry, but the «application» field is not avaiable in version v2 of the Datadog Service Catalog schema; this field is only available in version(s): v2.1',
    },
  },
  {
    version: 'v2.1',
    field: 'application',
    input: 'app-name',
    value: { application: 'app-name' },
  },
  {
    version: 'v2',
    field: 'description',
    input: 'some description',
    value: {
      error:
        'Sorry, but the «description» field is not avaiable in version v2 of the Datadog Service Catalog schema; this field is only available in version(s): v2.1',
    },
  },
  {
    version: 'v2.1',
    field: 'description',
    input: 'some description',
    value: { description: 'some description' },
  },
  {
    version: 'v2',
    field: 'tier',
    input: 'high',
    value: {
      error:
        'Sorry, but the «tier» field is not avaiable in version v2 of the Datadog Service Catalog schema; this field is only available in version(s): v2.1',
    },
  },
  {
    version: 'v2.1',
    field: 'tier',
    input: 'high',
    value: { tier: 'high' },
  },
  {
    version: 'v2',
    field: 'lifecycle',
    input: 'production',
    value: {
      error:
        'Sorry, but the «lifecycle» field is not avaiable in version v2 of the Datadog Service Catalog schema; this field is only available in version(s): v2.1',
    },
  },
  {
    version: 'v2.1',
    field: 'lifecycle',
    input: 'production',
    value: { lifecycle: 'production' },
  },
  {
    version: 'v2',
    field: 'docs',
    input: `
- name: 'first-doc'
  provider: jira
  url: https://my-org.atlassian.net/wiki/spaces/PROJ/pages/1234567890
`,
    value: {
      docs: [
        {
          name: 'first-doc',
          provider: 'jira',
          url: 'https://my-org.atlassian.net/wiki/spaces/PROJ/pages/1234567890',
        },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'docs',
    input: `
- name: 'first-doc'
  provider: jira
  url: https://my-org.atlassian.net/wiki/spaces/PROJ/pages/1234567890
`,
    value: {
      error:
        'Sorry, but the «docs» field is not avaiable in version v2.1 of the Datadog Service Catalog schema; this field is only available in version(s): v2',
    },
  },
  {
    version: 'v2',
    field: 'repos',
    input: `
- name: 'first-repo'
  provider: github
  url: https://github.com/arcxp/datadog-service-catalog-metadata-provider
`,
    value: {
      repos: [
        {
          name: 'first-repo',
          provider: 'github',
          url: 'https://github.com/arcxp/datadog-service-catalog-metadata-provider',
        },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'repos',
    input: `
- name: 'first-repo'
  provider: github
  url: https://github.com/arcxp/datadog-service-catalog-metadata-provider
`,
    value: {
      error:
        'Sorry, but the «repos» field is not avaiable in version v2.1 of the Datadog Service Catalog schema; this field is only available in version(s): v2',
    },
  },
  {
    version: 'v2.2',
    field: 'extensions',
    input: `
shopist.com/release-scheduler:
  release-manager:
    slack: "release-train-shopist"
    schedule: "* * * * *"
    env:
      - name: "staging"
        ci_pipeline: "//domains/examples/apps/hello-joe/config/k8s:release-staging"
        branch: "hello-joe/staging"
        schedule: "* * * * 1"
`,
    value: {
      extensions: {
        'shopist.com/release-scheduler': {
          'release-manager': {
            slack: 'release-train-shopist',
            schedule: '* * * * *',
            env: [
              {
                name: 'staging',
                ci_pipeline:
                  '//domains/examples/apps/hello-joe/config/k8s:release-staging',
                branch: 'hello-joe/staging',
                schedule: '* * * * 1',
              },
            ],
          },
        },
      },
    },
  },
])('$field:$version', ({ version, field, input, value }) => {
  afterAll(() => {
    core.setFailed.mockClear()
    core.setFailed.mockReset()
  })
  beforeEach(() => {
    core.setFailed.mockClear()
  })
  test('mapping', () => {
    if (value?.error) {
      expect(mapField(field, version)(input)).toBeUndefined()
      return
    }
    expect(mapField(field, version)(input)).toEqual(value)
  })

  test('failures', () => {
    if (!value?.error) {
      expect(core.setFailed).not.toHaveBeenCalled()
      return
    }

    mapField(field, version)(input)
    expect(core.setFailed).toHaveBeenCalledTimes(1)
    expect(core.setFailed).toHaveBeenLastCalledWith(value.error)
  })
})

describe('constants', () => {
  test('mappings', () => {
    expect(mappings).toMatchSnapshot()
  })

  test('convenienceFields', () => {
    expect(convenienceFields).toMatchSnapshot()
  })

  test('schemaFields', () => {
    expect(schemaFields).toMatchSnapshot()
  })
})
