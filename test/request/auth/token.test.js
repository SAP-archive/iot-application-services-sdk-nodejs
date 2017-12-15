/* global describe it */
var assert = require('assert')
var Token = require('../../../lib/request/auth/token')

describe('token', function () {
  describe('getAccessToken', function () {
    it('should return the stored token', function () {
      var jwtToken = 'jwestesestdsf8u98324'
      var token = new Token(jwtToken, null)

      assert.equal(jwtToken, token.getAccessToken())
    })
  })

  describe('isExpired', function () {
    it('should not be expired', function () {
      var expiresIn = 1000
      var token = new Token('1', expiresIn)

      assert.equal(false, token.isExpired())
    })

    it('should be expired', function () {
      var expiresIn = -1000
      var token = new Token('1', expiresIn)

      assert.equal(true, token.isExpired())
    })
  })
})
