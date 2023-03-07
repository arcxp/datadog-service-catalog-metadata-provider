const core = require('@actions/core')

let inputs = {}
core.__setInputsObject = (obj) => (inputs = obj)
core.__resetInputsObject = () => (inputs = {})

core.getInput = jest.fn().mockImplementation((name) => {
  return inputs[name]
})

module.exports = core
