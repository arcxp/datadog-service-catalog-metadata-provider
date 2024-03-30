const subject = require('../../lib/schemaVersions.cjs')

describe('lib/schemaVersions.cjs#inputMapperByVersion()', () => {
  test.each([{ version: 'v2' }, { version: 'v2.1' }, { version: 'v2.2' }])(
    '$version mapper',
    ({ version }) => {
      const mapper = subject.inputMapperByVersion(version)

      expect(mapper).toBeInstanceOf(Function)
      expect(mapper).not.toBe(subject._test.defaultMapper)
    },
  )

  test('default mapper', () => {
    const mapper = subject.inputMapperByVersion('blah')

    expect(mapper).toBeInstanceOf(Function)
    expect(mapper).toBe(subject._test.defaultMapper)
    expect(() => mapper()).toThrow(/Invalid\sschema\sversion/)
  })
})
