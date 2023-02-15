const core = require('@actions/core')

console.debug('!i!i!i!i!i!i ---- @actions/core mock is loaded ---- !i!i!i!i!i!i')

let inputs = {}
core.__setInputsObject = (obj) => (inputs = obj)
core.__resetInputsObject = () => (inputs = {})

core.getInput = jest.fn().mockImplementation((name) => {
  return inputs[name]
})

module.exports = core
