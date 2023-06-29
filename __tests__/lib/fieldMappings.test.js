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
})