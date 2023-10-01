const { validateDatadogHostname } = require('../../lib/input-validation')

describe('validateDatadogHostname()', () => {
  test('valid hostname', () => {
    expect(validateDatadogHostname('app.datadoghq.com')).toBe(
      'app.datadoghq.com',
    )
  })
})
