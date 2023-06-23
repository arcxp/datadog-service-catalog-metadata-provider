/**
 * @fileoverview This test covers all of the field mappings across versions.
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
    field: 'email',
    input: 'testing@manchicken.io',
    doc: {},
    value: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
    },
  },
  {
    version: 'v2',
    field: 'email',
    input: 'testing@manchicken.io',
    doc: {
      contacts: [
        {
          name: 'test',
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
      ],
    },
    value: {
      contacts: [
        {
          name: 'test',
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
        { type: 'email', contact: 'testing@manchicken.io' },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'email',
    input: 'testing@manchicken.io',
    doc: {
      contacts: [
        {
          name: 'test',
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
      ],
    },
    value: {
      contacts: [
        {
          name: 'test',
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
        { type: 'email', contact: 'testing@manchicken.io' },
      ],
    },
  },
  {
    version: 'v2',
    field: 'slack',
    input: 'https://my-org.slack.com/archives/my-channel',
    doc: {},
    value: {
      contacts: [
        {
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
      ],
    },
  },
  {
    version: 'v2',
    field: 'slack',
    input: 'https://my-org.slack.com/archives/my-channel',
    doc: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
    },
    value: {
      contacts: [
        { type: 'email', contact: 'testing@manchicken.io' },
        {
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
      ],
    },
  },
  {
    version: 'v2.1',
    field: 'slack',
    input: 'https://my-org.slack.com/archives/my-channel',
    doc: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
    },
    value: {
      contacts: [
        { type: 'email', contact: 'testing@manchicken.io' },
        {
          type: 'slack',
          contact: 'https://my-org.slack.com/archives/my-channel',
        },
      ],
    },
  },
  {
    version: 'v2',
    field: 'opsgenie',
    input:
      'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
    doc: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
    },
    value: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  },
  {
    version: 'v2.1',
    field: 'opsgenie',
    input:
      'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
    doc: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
    },
    value: {
      contacts: [{ type: 'email', contact: 'testing@manchicken.io' }],
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  },
  {
    version: 'v2',
    field: 'pagerduty',
    input: 'https://my-org.pagerduty.com/service-directory/PMyService',
    doc: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
    value: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
        pagerduty: 'https://my-org.pagerduty.com/service-directory/PMyService',
      },
    },
  },
  {
    version: 'v2.1',
    field: 'pagerduty',
    input: 'https://my-org.pagerduty.com/service-directory/PMyService',
    doc: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
    value: {
      integrations: {
        opsgenie: {
          'service-url':
            'https://www.opsgenies.com/service/123e4567-e89b-12d3-a456-426614174000',
        },
        pagerduty: {
          'service-url':
            'https://my-org.pagerduty.com/service-directory/PMyService',
        },
      },
    },
  },
])('$field:$version', ({ version, field, input, doc, value }) => {
  beforeEach(() => {
    core.setFailed.mockClear()
  })
  test('mapping', () => {
    expect(mapField(field, version)(input, doc)).toEqual(value)
  })
})
