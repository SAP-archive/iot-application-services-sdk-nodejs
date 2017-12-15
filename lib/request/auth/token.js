'use strict'
var debug = require('debug')('ae_nodewrapper:token')

/**
 * Stores a JWT-Token to authenticate at the API of SAP IoT Application Enablement.
 *
 * @constructor
 */
var token = module.exports = function (accessToken, expiresIn) {
  debug('Creating a new Token.')
  this._sAccessToken = accessToken
  this._iExpiresIn = expiresIn
  this._iExpiresAt = this.getExpiresAt(expiresIn)
}

/**
 * Returns the JWT-Token.
 *
 * @return {String} sToken - the stored JWT-Token
 */
token.prototype.getAccessToken = function () {
  debug('Getting AccessToken from Token')
  return this._sAccessToken
}

/**
 * Provides information about the expiration of the stored token.
 *
 * @return {Boolean} isExpired - true, if the stored token is expired
 */
token.prototype.isExpired = function () {
  debug('Checking the stored token regarding expiration.')

  var iCurrentTime = new Date().getTime() / 1000 // current time since 1.1.1970 in seconds

  return this._iExpiresAt < iCurrentTime
}

/**
 * Calculates the time at which the stored token expires.
 *
 * @param {Numeric} iExpiresIn - duration in which the token is valid
 * @return {Numeric} iExpiresAt - number of seconds calculated from 1.1.1970 in which the stored token expires
 */
token.prototype.getExpiresAt = function (iExpiresIn) {
  debug('Calculating the time at which the stored token expires.')

  var iCurrentTime = new Date().getTime() / 1000 // current time since 1.1.1970 in seconds
  var iExpiresAt = iCurrentTime + iExpiresIn

  return iExpiresAt - 60 // a timeframe of 60 seconds just to make sure the token is not expired when a slow request arrives at the api
}
