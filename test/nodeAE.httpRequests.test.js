/* global describe it beforeEach */
var assert = require('assert')
var nock = require('nock')
var NodeAE = require('../lib/nodeAE')

const sToken = '98723dsfsdf'

describe('nodeAE - httpRequests', function () {
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

  describe('post', function () {
    it('should return the API response', function (done) {
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

      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .post('/Locations')
        .reply(201, function (sUri, oBody) {
          assert.equal(JSON.stringify(oBody), JSON.stringify(oPayload))
          return undefined
        })

      // the request
      var nodeAE = new NodeAE()
      var promise = nodeAE.post('https://location.cfapps.eu10.hana.ondemand.com/Locations', oPayload)
      promise.then(
        function success (oResponse) {
          assert.equal(oResponse.body, undefined)
          done()
        },
        function error (err) {
          throw err
        }
      )
    })
  })

  describe('get', function () {
    it('should return the API response', function (done) {
      // intercept the request to the API
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, {
          Things: []
        })

      // the request
      var nodeAE = new NodeAE()
      var promise = nodeAE.get('https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things')
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
  })

  describe('put', function () {
    it('should return the API response', function (done) {
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

      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .put('/Locations(%27759CA6B9C6B0432398DBBDDAC84070A9%27)')
        .reply(200, function (sUri, oBody) {
          assert.equal(JSON.stringify(oBody), JSON.stringify(oPayload))
          return 'Successfully changed'
        })

      // the request
      var nodeAE = new NodeAE()
      var promise = nodeAE.put("https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')", oPayload)
      promise.then(
        function success (oResponse) {
          assert.equal(oResponse.body, 'Successfully changed')
          done()
        },
        function error (err) {
          throw err
        }
      )
    })
  })

  describe('delete', function () {
    it('should return the API response', function (done) {
      // intercept the request to the API
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .delete('/Locations(%27759CA6B9C6B0432398DBBDDAC84070A9%27)')
        .reply(204, '')

      // the request
      var nodeAE = new NodeAE()
      var promise = nodeAE.delete("https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')")
      promise.then(
        function success (oResponse) {
          assert.equal(oResponse.body, '')
          done()
        },
        function error (err) {
          throw err
        }
      )
    })
  })
})
