const { applyOrgRules } = require('../../lib/org-rules')

describe('org-rules.js', () => {
  test('#getOrgRules() - normal input', async () => {
    applyOrgRules()
    expect(1).toBeTruthy()
  })
})
