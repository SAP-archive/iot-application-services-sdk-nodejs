const debug = require('debug')('LeonardoIoT:Token');

/**
 *  @class Authenticator
 *  @author: Lukas Brinkmann, Jan Reichert
 *  Class representing a JWT token.
 */
class Token {
  /**
   * Create a Token
   * @param {string} accessToken - The JWT token.
   * @param {number} expiresIn - The number of seconds in which the token expires.
   */
  constructor(accessToken, expiresIn) {
    debug('Creating a new Token');
    this.accessToken = accessToken;

    const currentTime = new Date().getTime() / 1000; // current time since 1.1.1970 in seconds
    this.expiresAt = currentTime + expiresIn;
  }

  /**
   * Get the JWT token.
   * @return {string} The JWT token.
   */
  getAccessToken() {
    debug('Getting AccessToken from Token');
    return this.accessToken;
  }

  /**
   * Indicates if the token is expired.
   * @return {boolean} True, if the stored token is expired
   */
  isExpired() {
    debug('Checking the stored token regarding expiration');
    const currentTime = new Date().getTime() / 1000; // current time since 1.1.1970 in seconds
    return this.expiresAt < currentTime;
  }
}

module.exports = Token;
