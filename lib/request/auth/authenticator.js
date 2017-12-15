'use strict'
var debug = require('debug')('ae_nodewrapper:authenticator')
var request = require('request')
var Token = require('./token')

/**
 * Authenticates the client at the API of SAP IoT Application Enablement.
 *
 * To get the JWT-Token use the 'authenticator.getAccessToken()'-function. This object handles
 * everything else (authentication, expired tokens, etc.).
 *
 * @constructor
 * @param {String} sClientId - the id of the OAuth consumer client
 * @param {String} sClientSecret - the secret of the OAuth consumer client
 * @param {String} sAuthUrl - the API-Endpoint for authentification
 */
var authenticator = module.exports = function (sClientId, sClientSecret, sAuthUrl) {
  debug('Creating a new authenticator.')
  this._sClientId = sClientId
  this._sClientSecret = sClientSecret
  this._sAuthUrl = sAuthUrl
}

/**
 * Authenticates at the API of SAP IoT AE. If the client has authenticated before and
 * the JWT token is not expired, the function returns the old token and does not
 * authenticate again.
 *
 * @return {Promise} oToken - resolved with {String} JWT-Token
 */
authenticator.prototype.getAccessToken = function () {
  debug('Authenticating at the API of AE.')
  var that = this

  return new Promise((resolve, reject) => {
    if (that.oToken) { // check if we have stored a token
      if (that.oToken.isExpired()) {
        debug('The stored token is expired.')
        // get a new token at the end of this function
      } else {
        debug('The stored token is not expired.')
        resolve(that.oToken.getAccessToken()) // resolve with the stored token
        return
      }
    } else {
      debug('No token stored.')
      // get a new token at the end of this function
    }

      // get a new token
    var loadingNewToken = that.getNewToken()
    loadingNewToken.then(
      function success (oToken) {
        that.oToken = oToken
        resolve(that.oToken.getAccessToken())
      },
      function error (err) {
        reject(err)
      }
    )
  })
}

/**
 * Gets a new token for the API of SAP IoT Application Enablement.
 *
 * @return {Promise} oToken - promise resolved with the {Token} token-object
 */
authenticator.prototype.getNewToken = function () {
  debug('Getting a new token.')
  var that = this
  var sCredentialsBase64 = Buffer.from(this._sClientId + ':' + this._sClientSecret).toString('base64')

  return new Promise((resolve, reject) => {
    request(
      {
        url: that._sAuthUrl,
        method: 'POST',
        form: {
          'grant_type': 'client_credentials',
          'response_type': 'token'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + sCredentialsBase64
        }
      },
      function handleResponse (err, oResponse, oBody) { // handles the response from the server
        // handle errors
        if (err) {
          debug(err)
          reject(err)
          return
        }

        if (oResponse.statusCode === 401) {
          debug('Bad credentials.')
          reject(new Error('Bad credentials'))
        } else if (oResponse.statusCode === 404) {
          debug('Token URL not found.')
          reject(new Error('Token URL not found'))
        } else if (oResponse.statusCode !== 200) {
          debug('Authentification at the API was not sucessfull')
          reject(oResponse)
        } else { // no error
          debug('Authentification was successfull')
          var oResponseBody = JSON.parse(oResponse.body)
          var oToken = new Token(oResponseBody.access_token, oResponseBody.expires_in)
          resolve(oToken)
        }
      }
    )
  })
}
