/* global describe it beforeEach */
var assert = require('assert')
var nock = require('nock')
var NodeAE = require('../lib/nodeAE')

const sToken = '98723dsfsdf'
const sClientId = 'clientId'
const sClientSecret = 'clientSecret'

describe('nodeAE', function () {
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

  describe('new nodeAE - with config object', function () {
    it('should have initialized the config-object and the requestor', function () {
      var nodeAE = new NodeAE({
        clientId: sClientId,
        clientSecret: sClientSecret,
        tenant: 'sap-iotaehandson',
        landscape: 'eu10',
        host: 'hana.ondemand.com'
      })

      // check the config-object
      assert.equal(nodeAE._oConfig.sClientId, sClientId)
      assert.equal(nodeAE._oConfig.sClientSecret, sClientSecret)
      assert.equal(nodeAE._oConfig.sTenant, 'sap-iotaehandson')
      assert.equal(nodeAE._oConfig.sLandscape, 'eu10')
      assert.equal(nodeAE._oConfig.sHost, 'hana.ondemand.com')

      // check the requestor
      assert.equal(typeof nodeAE._oRequestor, 'object')
    })

    it('should throw an error as process-variables are not set', function () {
      try {
        delete process.env.AE_OAUTH_CLIENT_ID
        delete process.env.AE_OAUTH_CLIENT_SECRET
        delete process.env.AE_TENANT
        delete process.env.AE_LANDSCAPE
        delete process.env.AE_HOST
        var n = new NodeAE()
        throw Error(n) // should not go until here
      } catch (err) {
        assert.equal(err.message, 'Not all environment variables are set.')
      }
    })
  })

  describe('new nodeAE', function () {
    it('should have initialized the config-object and the requestor', function () {
      // set process variables (-> dotenv does not load the .env-file)
      process.env.AE_OAUTH_CLIENT_ID = sClientId
      process.env.AE_OAUTH_CLIENT_SECRET = sClientSecret
      process.env.AE_TENANT = 'sap-iotaehandson'
      process.env.AE_LANDSCAPE = 'eu10'
      process.env.AE_HOST = 'hana.ondemand.com'
      var nodeAE = new NodeAE()

      // check the config-object
      assert.equal(nodeAE._oConfig.sClientId, sClientId)
      assert.equal(nodeAE._oConfig.sClientSecret, sClientSecret)
      assert.equal(nodeAE._oConfig.sTenant, 'sap-iotaehandson')
      assert.equal(nodeAE._oConfig.sLandscape, 'eu10')
      assert.equal(nodeAE._oConfig.sHost, 'hana.ondemand.com')

      // check the requestor
      assert.equal(typeof nodeAE._oRequestor, 'object')
    })

    it('should throw an error as process-variables are not set', function () {
      delete process.env.AE_OAUTH_CLIENT_ID
      try {
        var n = new NodeAE()
        throw Error(n) // should not go until here
      } catch (err) {
        assert.equal(err.message, 'Not all environment variables are set.')
      }
    })
  })

  describe('baseURI', function () {
    it('should set the base URI', function () {
      var sMicroservice = 'location'
      var sCorrectBaseURI = 'https://' + sMicroservice + '.cfapps.' + process.env.AE_LANDSCAPE + '.' + process.env.AE_HOST
      process.env.AE_OAUTH_CLIENT_ID = sClientId
      process.env.AE_OAUTH_CLIENT_SECRET = sClientSecret
      process.env.AE_TENANT = 'sap-iotaehandson'
      process.env.AE_LANDSCAPE = 'eu10'
      process.env.AE_HOST = 'hana.ondemand.com'
      var nodeAE = new NodeAE()
      nodeAE.setBaseURI(sMicroservice)
      assert.equal(nodeAE.getBaseURI(), sCorrectBaseURI)
    })

    it('should delete the base URI', function () {
      var nodeAE = new NodeAE()
      nodeAE.setBaseURI('location')
      nodeAE.deleteBaseURI()
      assert.equal(nodeAE.getBaseURI(), undefined)
    })
  })
})
