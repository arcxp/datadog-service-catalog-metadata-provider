const { expandObjectInputs } = require('../input-expander')

describe('input-expander.js', () => {
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
})