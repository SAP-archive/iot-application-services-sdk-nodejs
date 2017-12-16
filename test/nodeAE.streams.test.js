/* global describe it beforeEach */
var assert = require('assert')
var nock = require('nock')
var NodeAE = require('../lib/nodeAE')

const sToken = '98723dsfsdf'

describe('nodeAE - streams', function () {
  beforeEach(function () {
    // set process variables (-> dotenv does not load the .env-file)
    process.env.AE_OAUTH_CLIENT_ID = 'clientId'
    process.env.AE_OAUTH_CLIENT_SECRET = 'clientSecret'
    process.env.AE_TENANT = 'sap-iotaehandson'
    process.env.AE_LANDSCAPE = 'eu10'
    process.env.AE_HOST = 'hana.ondemand.com'

    // intercept the request to the authentification server
    nock('https://sap-iotaehandson.authentication.eu10.hana.ondemand.com')
      .post('/oauth/token')
      .reply(200, {
        'access_token': sToken,
        'expires_in': 10000
      })
  })

  describe('openPostStream', function () {
    it('should stream the API response', function (done) {
      var nodeAE = new NodeAE()
      var oPayload = {
        'basicData': {
          'locationID': '759CA6B9C6B0432398DBBDDAC84070A9',
          'tenant': 'sap-iotaehandson',
          'etag': '1'
        },
        'locationData': {
          'streetName': 'Hasso-Plattner-Ring',
          'houseNumber': '8',
          'cityName': 'Walldrof',
          'postalCode': '69190',
          'country': 'DE',
          'longitude': 8.636881,
          'latitude': 49.294464
        }
      }
      var sResponse = 'success'

      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .post('/Locations')
        .reply(201, function (sUri, oBody) {
          assert.equal(JSON.stringify(oBody), JSON.stringify(oPayload))
          return sResponse
        })

      // the request
      var openingStream = nodeAE.openPostStream('https://location.cfapps.eu10.hana.ondemand.com/Locations', oPayload)
      openingStream.then(
        function success (stream) {
          assertEqualStream(stream, sResponse)
          done()
        },
        function error (err) {
          throw err
        }
      )
    })
  })

  describe('openGetStream', function () {
    it('should stream the API response', function (done) {
      var nodeAE = new NodeAE()
      var oPayload = {
        Things: []
      }

      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, oPayload)

      // the request
      var openingStream = nodeAE.openGetStream('https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
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
  })

  describe('openPutStream', function () {
    it('should stream the API response', function (done) {
      var nodeAE = new NodeAE()
      var oPayload = {
        'basicData': {
          'locationID': '759CA6B9C6B0432398DBBDDAC84070A9',
          'tenant': 'sap-iotaehandson',
          'etag': '1'
        },
        'locationData': {
          'streetName': 'Hasso-Plattner-Ring',
          'houseNumber': '8',
          'cityName': 'Walldrof',
          'postalCode': '69190',
          'country': 'DE',
          'longitude': 8.636881,
          'latitude': 49.294464
        }
      }
      var sResponse = 'success'

      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .put('/Locations')
        .reply(201, function (sUri, oBody) {
          assert.equal(JSON.stringify(oBody), JSON.stringify(oPayload))
          return sResponse
        })

      // the request
      var openingStream = nodeAE.openPutStream("https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')", oPayload)
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
  })

  describe('openDeleteStream', function () {
    it('should stream the API response', function (done) {
      var nodeAE = new NodeAE()
      var sResponse = 'success'

      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .delete('/Locations(%27759CA6B9C6B0432398DBBDDAC84070A9%27)')
        .reply(204, sResponse)

      // the request
      var openingStream = nodeAE.openDeleteStream("https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')")
      openingStream.then(
        function success (stream) {
          assertEqualStream(stream, sResponse)
          done()
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
