const {
  logPass,
  parseSafely,
  FailedParse,
  expandObjectInputs,
  parseYamlExpectArray,
  parseYamlExpectObject,
  parseYamlExpectDatadogTags,
  isNothing,
  combineValues,
} = require('../../lib/input-expander')

describe('input-expander.cjs - parsers', () => {
  test('#parseSafely()', () => {
    expect(parseSafely('---\n- \nnull\n')).toBe(FailedParse)
  })
  test('#expandObjectInputs() - empty input', () => {
    // Let's try empty strings
    const testText = ''
    const testParsed = expandObjectInputs(testText)
    console.log(testParsed)
    expect(testParsed).toStrictEqual('')
  })

  test('#expandObjectInputs() - just a number', () => {
    // Just a number
    const testText = '1'
    const testParsed = expandObjectInputs(testText)
    expect(testParsed).toStrictEqual(1)
  })

  test('#expandObjectInputs() - just a string', () => {
    // Just a string
    const testText = 'foo'
    const testParsed = expandObjectInputs(testText)
    expect(testParsed).toStrictEqual('foo')
  })

  test('#expandObjectInputs() - just a boolean', () => {
    // Just a boolean
    const testText = 'true'
    const testParsed = expandObjectInputs(testText)
    expect(testParsed).toStrictEqual(true)
  })

  test('#expandObjectInputs() - simple yaml', () => {
    // Let's try empty objects
    const testText = `
---
foo: bar
`
    const testParsed = expandObjectInputs(testText)
    expect(testParsed).toStrictEqual({ foo: 'bar' })
  })

  test('#expandObjectInputs()', () => {
    // Let's just try to expand some inputs.
    const testText = `
---
plain-yaml:
  - a
  - b
  - c
nested-yaml:
  subtree: |
    - a
    - b:
      - 1
      - true
      - null
    - c
    `
    const testParsed = expandObjectInputs(testText)
    expect(testParsed).toEqual({
      'plain-yaml': ['a', 'b', 'c'],
      'nested-yaml': {
        subtree: ['a', { b: [1, true, null] }, 'c'],
      },
    })
  })
  test('#parseYamlExpectArray() - single element', () => {
    const yamlSingleElement = 'foo'
    expect(parseYamlExpectArray(yamlSingleElement)).toEqual(['foo'])
  })

  test('#parseYamlExpectArray() - multiple elements', () => {
    const yamlMultiElement = `
- foo
- bar
`
    expect(parseYamlExpectArray(yamlMultiElement)).toEqual(['foo', 'bar'])
  })

  test('#parseYamlExpectObject() - empty', () => {
    expect(parseYamlExpectObject(null)).toEqual({})
  })

  test('#parseYamlExpectObject() - single element', () => {
    const yamlSingleElement = 'foo'
    expect(parseYamlExpectObject(yamlSingleElement)).toEqual({ value: 'foo' })
  })

  test('#parseYamlExpectObject() - multiple elements', () => {
    const yamlMultiElement = `
foo: bar
a: b
`
    expect(parseYamlExpectObject(yamlMultiElement)).toEqual({
      foo: 'bar',
      a: 'b',
    })
  })

  test('#parseYamlExpectDatadogTags() - mix-and-match', () => {
    const input = `
- plain:nospaces
- compat1: space-in-value
- compat2 : space-in-both
- number_value : 42
`
    const expectedTags = [
      'plain:nospaces',
      'compat1:space-in-value',
      'compat2:space-in-both',
      'number_value:42',
    ]

    expect(parseYamlExpectDatadogTags(input)).toEqual(expectedTags)
  })
})

describe('input-expander.cjs - utilities', () => {
  test.each([
    { value: {}, outcome: true },
    { value: [], outcome: true },
    { value: null, outcome: true },
    { value: undefined, outcome: true },
    { value: [0], outcome: false },
    { value: new Date(), outcome: false },
    { value: 0, outcome: false },
    { value: 1, outcome: false },
    { value: { a: undefined }, outcome: false },
    { value: '', outcome: true },
  ])('#isNothing($value) should be $outcome', ({ value, outcome }) => {
    expect(isNothing(value)).toBe(outcome)
  })

  test.each([
    {
      label: 'no-op for undefined value',
      value: undefined,
      key: 'b',
      target: { a: [1] },
      expected: { a: [1] },
    },
    {
      label: 'no-op for empty array',
      value: [],
      key: 'b',
      target: { a: [1] },
      expected: { a: [1] },
    },
    {
      label: 'add new key to object',
      value: 1,
      key: 'b',
      target: { a: [1] },
      expected: { a: [1], b: 1 },
    },
    {
      label: 'merge array on existing key',
      value: [1],
      key: 'a',
      target: { a: [1] },
      expected: { a: [1, 1] },
    },
    {
      label: 'merge object on existing key',
      value: { b: 1 },
      key: 'val',
      target: { val: { a: 1 } },
      expected: { val: { a: 1, b: 1 } },
    },
  ])(
    '#combineValues($value, $key, ...) - $label',
    ({ value, key, target, expected }) => {
      expect(combineValues(value, key, target)).toEqual(expected)
    },
  )

  test.each([
    {
      label: 'Not an array',
      value: 1,
      key: 'foo',
      target: { foo: [0] },
      match: /^Value.*?Array.*?$/,
    },
    {
      label: 'Not an object',
      value: 1,
      key: 'foo',
      target: { foo: { a: 0 } },
      match: /^Value.*?Object.*?$/,
    },
  ])(
    '#combineValues($value, $key, ...) - Error case: $label',
    ({ value, key, target, match }) => {
      expect(() => combineValues(value, key, target)).toThrow(match)
    },
  )
})
