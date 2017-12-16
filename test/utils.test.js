/* global describe it */
var assert = require('assert')
var Utils = require('../lib/request/utils')

describe('utils', function () {
  describe('isValidURI', function () {
    it('should return true as a valid URIs are passed', function () {
      var sURI = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq CFB81003B9574F4EBDE98C31396ACE34'
      assert.equal(Utils.isValidURI(sURI), true)

      sURI = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq null'
      assert.equal(Utils.isValidURI(sURI), true)
    })

    it('should return false as a non valid uri is set', function () {
      var sURI = 'ysz'
      assert.equal(Utils.isValidURI(sURI), false)
    })
  })
})
