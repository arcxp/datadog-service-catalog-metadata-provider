console.log('inner-action-test.js: I am here!')

describe('sanity', () => {
  test('sanity', () => {
    expect(true).toBe(true)
    console.debug(process.env)
  })
})