'use strict'
const debug = require('debug')('ae_nodewrapper:authenticator')
const request = require('./../utils/request-wrapper')
const Token = require('./token')

/**
 * Authenticates the client at the API of SAP IoT Application Enablement.
 *
 * To get the JWT-Token use the 'authenticator.getAccessToken()'-function. This object handles
 * everything else (authentication, expired tokens, etc.).
 *
 * @class
 */
class Authenticator {
  /**
   * Inits a new Authenticator.
   *
   * @constructor
   * @param {String} clientId - the id of the OAuth consumer client
   * @param {String} clientSecret - the secret of the OAuth consumer client
   * @param {String} authUrl - the API-Endpoint for authentification
   */
  constructor (clientId, clientSecret, authUrl) {
    debug('Creating a new authenticator.')
    this._clientId = clientId
    this._clientSecret = clientSecret
    this._authUrl = authUrl // TODO create auth url here
  }

  /**
   * Authenticates at the API of SAP IoT AE. If the client has authenticated before and
   * the JWT token is not expired, the function returns the old token and does not
   * authenticate again.
   *
   * @return {Promise} oToken - resolved with {String} JWT-Token
   */
  async getAccessToken () {
    debug('Authenticating at the API of AE.')

    // if we don´t have a token or the stored token is expired, get a new one
    if (!this._token || this._token.isExpired()) {
      try {
        this._token = await this.getNewToken()
      } catch (error) {
        throw error
      }
    }

    return this._token.getAccessToken()
  }

  /**
   * Gets a new token for the API of SAP IoT Application Enablement.
   *
   * @return {Promise} oToken - promise resolved with the {Token} token-object
   */
  async getNewToken () {
    debug('Getting a new token.')

    const credentialsBase64 = Buffer.from(this._clientId + ':' + this._clientSecret).toString('base64')

    let response
    try {
      response = await request({
        url: this._authUrl,
        method: 'POST',
        form: {
          'grant_type': 'client_credentials',
          'response_type': 'token'
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + credentialsBase64
        }
      })
    } catch (error) {
      debug(error)
      throw error
    }

    switch (response.statusCode) {
      case 401:
        debug('Bad credentials.')
        throw new Error('Bad credentials')
      case 404:
        debug('Token URL not found.')
        throw new Error('Token URL not found')
      case 200:
        debug('Authentification was successfull')
        const responseBody = JSON.parse(response.body)
        const token = new Token(responseBody.access_token, responseBody.expires_in)
        return token
      default:
        debug('Authentification at the API was not sucessfull')
        throw new Error('Authentification at the API was not sucessfull')
    }
  }
}

module.exports = Authenticator
