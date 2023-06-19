/**
 * @fileoverview This test covers all of the field mappings across versions.
 **/

const { mappings, mapField } = require('../../lib/fieldMappings')

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
])('$field:$version', ({ version, field, input, value }) => {
  test('mapping', () => {
    console.debug(
      JSON.stringify(
        { result: mapField(field, version)(input), value },
        undefined,
        2,
      ),
    )
    expect(mapField(field, version)(input)).toEqual(value)
  })
})
