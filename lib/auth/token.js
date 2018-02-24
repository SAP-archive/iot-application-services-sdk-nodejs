'use strict'
const debug = require('debug')('ae_nodewrapper:token')

/**
 * Stores a JWT-Token to authenticate at the API of SAP IoT Application Enablement.
 *
 * @class
 */
class Token {
  /**
   * Inits a new Token.
   * @constructor
   *
   * @param {*} accessToken
   * @param {*} expiresIn
   */
  constructor (accessToken, expiresIn) {
    debug('Creating a new Token.')
    this._accessToken = accessToken
    this._expiresIn = expiresIn
    this._expiresAt = this.getExpiresAt(expiresIn)
  }

  /**
   * Returns the JWT-Token.
   *
   * @return {String} sToken - the stored JWT-Token
   */
  getAccessToken () {
    debug('Getting AccessToken from Token')
    return this._accessToken
  }

  /**
   * Provides information about the expiration of the stored token.
   *
   * @return {Boolean} isExpired - true, if the stored token is expired
   */
  isExpired () {
    debug('Checking the stored token regarding expiration.')
    const currentTime = new Date().getTime() / 1000 // current time since 1.1.1970 in seconds
    return this._expiresAt < currentTime
  }

  /**
   * Calculates the time at which the stored token expires.
   *
   * @param {Numeric} expiresIn - duration in which the token is valid
   * @return {Numeric} iExpiresAt - number of seconds calculated from 1.1.1970 in which the stored token expires
   */
  getExpiresAt (expiresIn) {
    debug('Calculating the time at which the stored token expires.')

    const currentTime = new Date().getTime() / 1000 // current time since 1.1.1970 in seconds
    const expiresAt = currentTime + expiresIn

    return expiresAt - 60 // a timeframe of 60 seconds just to make sure the token is not expired when a slow request arrives at the api
  }
}

module.exports = Token
