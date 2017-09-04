/* eslint-env mocha */

'use strict'

const expect = require('chai').expect
const chrome = require('sinon-chrome')

describe('sinon-chrome', function () {
  it('has property runtime', function () {
    expect(chrome).to.have.property('runtime')
  })
})
