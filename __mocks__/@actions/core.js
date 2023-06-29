const core = require('@actions/core')

let inputs = {}
core.__setInputsObject = (obj) => (inputs = obj)
core.__resetInputsObject = () => (inputs = {})
core.__dumpInputsObject = () => console.debug({ CORE_INPUTS: inputs })

core.getInput = jest.fn().mockImplementation((name) => {
  return inputs[name]
})

core.setFailed = jest.fn()

module.exports = core
