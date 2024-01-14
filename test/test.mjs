/* eslint-env mocha */

'use strict'

import { expect } from 'chai';
import chrome from 'sinon-chrome';

describe('sinon-chrome', function () {
  it('has property runtime', function () {
    expect(chrome).to.have.property('runtime')
  })
})
