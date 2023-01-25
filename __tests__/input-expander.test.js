const { expandObjectInputs } = require('../input-expander')

describe('input-expander.js', () => {
  test('#expandObjectInputs() - empty input', () => {
    // Let's try empty strings
    const testText = ''
    const testParsed = expandObjectInputs(testText)
    console.log(testParsed)
    expect(testParsed).toStrictEqual("")
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
    expect(testParsed).toStrictEqual({ foo: "bar" })
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
    expect(testParsed).toEqual(
      {
        'plain-yaml': ['a', 'b', 'c'],
        'nested-yaml': {
          subtree: ['a', { b: [1, true, null] }, 'c']
        }
      }
    )
  })

  // Do some tests which will validate the schema against the parsed
  // input object.
  test('#expandObjectInputs() - small schema validation', () => {
    // Let's just try to expand some inputs.
  })
})