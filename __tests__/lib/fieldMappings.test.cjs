/**
 * @fileoverview This test covers all of the field mappings across versions.
 * @jest-environment node
 * @group ci
 * @author Mike Stemle <themanchicken@duck.com>
 **/

const core = require('@actions/core')
const {
  mappings,
  convenienceFields,
  schemaFields,
  mapField,
} = require('../../lib/fieldMappings')

describe('constants', () => {
  test('mappings', () => {
    expect(mappings).toMatchSnapshot()
  })

  test('convenienceFields', () => {
    expect(convenienceFields).toMatchSnapshot()
  })

  test('schemaFields', () => {
    expect(schemaFields).toMatchSnapshot()
  })

  test('mapField for invalid field', () => {
    core.setFailed.mockReset()
    core.setFailed.mockClear()
    mapField('v2', 'invalid-field', 'test')('foo:bar')
    expect(core.setFailed).toHaveBeenCalledTimes(1)
    core.setFailed.mockReset()
    core.setFailed.mockClear()
  })
})

describe('
