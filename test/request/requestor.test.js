/* global describe it beforeEach */
var assert = require('assert')
var nock = require('nock')
var Requestor = require('../../lib/request/requestor')

const sToken = '98723dsfsdf'
const sClientId = 'clientId'
const sClientSecret = 'clientSecret'
const sTenant = 'sap-iotaehandson'
const sLandscape = 'eu10'
const sHost = 'hana.ondemand.com'

describe('requestor', function () {
  beforeEach(function () {
    // intercept the request to the authentification server
    nock('https://sap-iotaehandson.authentication.eu10.hana.ondemand.com')
      .post('/oauth/token')
      .reply(function (sUri, oRequestBody) {
        // check credentials
        var sCredentialsBase64 = Buffer.from(sClientId + ':' + sClientSecret).toString('base64')
        if (this.req.headers.authorization === 'Basic ' + sCredentialsBase64) {
          return [
            200, // statusCode
            { // responseBody
              'access_token': sToken,
              'expires_in': 10000
            }
          ]
        } else {
          return [
            401, // statusCode
            'Bad credentials' // responseBody
          ]
        }
      })
  })

  describe('_getRequest', function () {
    it('should return a request-object', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      var sHttpMethod = 'GET'
      var sURI = 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things'
      var oBody = { 'test': 'test-value' }

      var loadingRequest = requestor._getRequest(sHttpMethod, sURI, oBody, { 'If-Match': '3' })
      loadingRequest.then(
        function succes (oRequest) {
          assert.equal(oRequest.method, sHttpMethod)
          assert.equal(oRequest.url, sURI)
          assert.equal(JSON.stringify(oRequest.json), JSON.stringify(oBody))
          assert.equal(JSON.stringify(oRequest.headers), '{"Authorization":"Bearer 98723dsfsdf","If-Match":"3"}')
          done()
        },
        function error (oError) {
          throw oError
        }
      )
    })

    it('should handle bad credentials', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)
      requestor._oAuthenticator._sClientSecret = 'wrongSecret'

      var sHttpMethod = 'GET'
      var sURI = 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things'
      var oBody = { 'test': 'test-value' }

      var loadingRequest = requestor._getRequest(sHttpMethod, sURI, oBody, { 'If-Match': '3' })
      loadingRequest.then(
        function succes (oRequest) {
          throw Error('Should not be here')
        },
        function error (oError) {
          console.log(oError.message)
          assert.equal(oError.message, 'Bad credentials')
          done()
        }
      )
    })

    it('should use the base URI', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)
      requestor.setBaseURI('appiot-mds')

      var loadingRequest = requestor._getRequest('GET', '/test')
      loadingRequest.then(
        function succes (oRequest) {
          assert.equal(oRequest.url, requestor.getBaseURI() + '/test')
          done()
        },
        function error (oError) {
          throw oError
        }
      )
    })

    it('should not use the base URI as a valid URI is passed', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)
      requestor.setBaseURI('appiot-mds')

      var sURI = 'https://location.cfapps.eu10.hana.ondemand.com/test'

      var loadingRequest = requestor._getRequest('GET', sURI)
      loadingRequest.then(
        function succes (oRequest) {
          assert.equal(oRequest.url, sURI)
          done()
        },
        function error (oError) {
          throw oError
        }
      )
    })

    it('should throw an error as a non-valid URI is passed and base URI is not set', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      var loadingRequest = requestor._getRequest('GET', 'ps.eu10.hana.ondemand.com/test')
      loadingRequest.then(
        function succes (oRequest) {
          throw new Error('should not be here')
        },
        function error (oError) {
          assert.equal(oError.message, 'The passed URI is not valid and no base URI is set.')
          done()
        }
      )
    })

    it('should throw an error as a non-valid resource path is passed', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)
      requestor.setBaseURI('appiot-mds')

      var loadingRequest = requestor._getRequest('GET', 'test')
      loadingRequest.then(
        function succes (oRequest) {
          throw new Error('should not be here')
        },
        function error (oError) {
          assert.equal(oError.message, "'test' is not a valid resource path.")
          done()
        }
      )
    })
  })

  describe('sendRequest', function () {
    it('should return the API response', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, {
          Things: []
        })

      // the request
      var promise = requestor.sendRequest('GET', 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
      promise.then(
        function success (oResponse) {
          assert.equal(oResponse.body, '{"Things":[]}')
          done()
        },
        function error (err) {
          throw err
        }
      )
    })

    it('should return an error', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .replyWithError('something awful happened')

      // the request
      var promise = requestor.sendRequest('GET', 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
      promise.then(
        function success (oResponse) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.message, 'something awful happened')
          done()
        }
      )
    })

    it('should handle an response code !== 200', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(400, 'Error')

      // the request
      var promise = requestor.sendRequest('GET', 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
      promise.then(
        function success (sToken) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.body, 'Error')
          done()
        }
      )
    })
  })

  describe('openStream', function () {
    it('should stream API response', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)
      var oPayload = {
        Things: []
      }

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, oPayload)

      // the request
      var openingStream = requestor.openStream('GET', 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
      openingStream.then(
        function success (stream) {
          assertEqualStream(stream, JSON.stringify(oPayload))
          done()
        },
        function error (err) {
          throw err
        }
      )
    })

    it('should return an error', function (done) {
      var requestor = new Requestor(sTenant, sLandscape, sHost, sClientId, sClientSecret)

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .replyWithError('something awful happened')

      // the request
      var openingStream = requestor.openStream('GET', 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
      openingStream.then(
        function success (oStream) {
          oStream
            .on('error', function (oError) {
              assert.equal(oError.message, 'something awful happened')
              done()
            })
        },
        function error (err) {
          throw err
        }
      )
    })
  })

  // checks if the stream streams the expected output
  function assertEqualStream (stream, sExpected) {
    let aStreamedBytes = Buffer.from('')

    stream
      .on('data', function (chunk) {
        aStreamedBytes = Buffer.concat([aStreamedBytes, chunk])
      })
      .on('end', function () {
        assert.equal(aStreamedBytes.toString(), sExpected)
      })
  }
})
