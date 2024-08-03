const subject = require('../../lib/component-mappings.cjs')

describe('imports', () => {
  test('verify imports', () => {
    expect(subject).toMatchObject({
      mapComponents: expect.any(Function),
      _test: expect.objectContaining({
        mapComponentMetadata: expect.any(Function),
        mapEntityComponent: expect.any(Function),
        mapServiceComponent: expect.any(Function),
        mapDatastoreComponent: expect.any(Function),
      }),
    })
  })
})

describe('component metadata', () => {
  // Let's test the entity types
  test('#mapComponentMetadata()', () => {
    expect(subject._test.mapComponentMetadata())
  })
})

/*
describe('entity types', () => {
  // Let's test the entity types
})

describe('service types', () => {
  // Let's test the service types
})

describe('datastore types', () => {
  // Let's test the datastore types
})

describe('handle the full list of components', () => {
  // Let's test the full list of components
})*/
