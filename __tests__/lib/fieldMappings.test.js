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
  // STOPPED HERE
  {
    version: 'v2',
    field: 'contacts',
    input: `
name: Testy McTester
type: email
contact: testy@mctester.com
`,
    value: { contacts: '' },
  },
])('$field:$version', ({ version, field, input, value }) => {
  test('mapping', () => {
    console.debug({ result: mapField(field, version)(input), value })
    expect(mapField(field, version)(input)).toEqual(value)
  })
})
