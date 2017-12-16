/* global describe it */
var assert = require('assert')
var BaseURI = require('../../lib/request/baseURI')

const sLandscape = 'landscape'
const sHost = 'host'

describe('baseURI', function () {
  describe('setBaseURI', function () {
    it('should set the base URI', function () {
      var sMicroservice = 'location'
      var sCorrectBaseURI = 'https://' + sMicroservice + '.cfapps.' + sLandscape + '.' + sHost

      var baseURI = new BaseURI(sLandscape, sHost)
      baseURI.setBaseURI(sMicroservice)
      assert.equal(baseURI._sBaseURI, sCorrectBaseURI)
    })

    it("should return error 'unknown microservice'", function () {
      var baseURI = new BaseURI(sLandscape, sHost)
      try {
        baseURI.setBaseURI('locations') // wrong (plural)
        throw Error() // should not go until here
      } catch (err) {
        assert.equal(err.message, 'Unknown microservice.')
      }
    })
  })

  describe('getBaseURI', function () {
    it('should return the base URI', function () {
      var baseURI = new BaseURI(sLandscape, sHost)
      baseURI._sBaseURI = 'something'
      assert.equal(baseURI.getBaseURI(), 'something')
    })
  })

  describe('deleteBaseURI', function () {
    it('should delete the base URI', function () {
      var baseURI = new BaseURI(sLandscape, sHost)
      baseURI._sBaseURI = 'something'
      baseURI.deleteBaseURI()
      assert.equal(baseURI.sBaseURI, undefined)
    })
  })
})
