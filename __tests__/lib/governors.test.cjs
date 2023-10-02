// Need to use inputs for some of our parameters
const core = require('@actions/core')

const {DatadogPostGovernor } = require('../../lib/governors')

describe('DatadogPostGovernor', () => {
  test('init', () => {
    DatadogPostGovernor.init()
    expect(DatadogPostGovernor.state).toBe(0)
    expect(DatadogPostGovernor.limit).toBe(10)
    DatadogPostGovernor.init(42)
    expect(DatadogPostGovernor.state).toBe(0)
    expect(DatadogPostGovernor.limit).toBe(42)
  })

  test('increment', () => {
    DatadogPostGovernor.init()
    expect(DatadogPostGovernor.state).toBe(0)
    expect(DatadogPostGovernor.limit).toBe(10)

    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(1)

    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(2)
  })

  test('enforcement', () => {
    DatadogPostGovernor.init(3)
    expect(DatadogPostGovernor.state).toBe(0)
    expect(DatadogPostGovernor.limit).toBe(3)
    
    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(1)
    expect(core.setFailed).not.toHaveBeenCalled()
    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(2)
    expect(core.setFailed).not.toHaveBeenCalled()
    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(3)
    expect(core.setFailed).not.toHaveBeenCalled()

    DatadogPostGovernor.increment()
    expect(DatadogPostGovernor.state).toBe(3)
    expect(core.setFailed).toHaveBeenCalled()
  })
})
