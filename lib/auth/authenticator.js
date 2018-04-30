const debug = require('debug')('ae_nodewrapper:authenticator');
const rp = require('request-promise-native');
const Token = require('./Token');

/** Class authenticating the client at the API of SAP IoT Application Enablement. */
class Authenticator {
  /**
   * Create a new Authenticator.
   * @constructor
   * @param {string} config.tenant - The tenant of SAP IoT Application Enablement.
   * @param {string} config.landscape - The landscape of the SAP IoT Application Enablement tenant.
   * @param {string} config.host - The host of the SAP IoT Application Enablement tenant.
   * @param {string} config.clientId - The OAuth user of the SAP IoT Application Enablement tenant.
   * @param {string} config.clientSecret - The OAuth secret of the SAP IoT Application
   * Enablement tenant.
   */
  constructor({
    tenant, landscape, host, clientId, clientSecret,
  }) {
    debug('Creating a new authenticator');
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authUrl = `https://${tenant}.authentication.${landscape}.${host}/oauth/token`;
  }

  /**
   * Retrieves a JWT Token to authenticate at the API of SAP IoT Application Enablement.
   * If the client has authenticated before and the JWT token is not expired, no
   * new JWT Token is requested.
   * @return {string} The JWT Token.
   */
  async getAccessToken() {
    debug('Authenticating at the API of AE.');

    // if we don´t have a token or the stored token is expired, get a new one
    if (!this.token || this.token.isExpired()) {
      try {
        this.token = await this.getNewToken();
      } catch (error) {
        throw error;
      }
    }

    return this.token.getAccessToken();
  }

  /**
   * Retrieves a new JWT token to authenticate at the API of SAP IoT Application Enablement.
   * @return {Token} The JWT Token.
   */
  async getNewToken() {
    debug('Getting a new token.');

    const credentialsBase64 = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    let responseBody;
    try {
      responseBody = await rp({
        url: this.authUrl,
        method: 'POST',
        form: {
          grant_type: 'client_credentials',
          response_type: 'token',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentialsBase64}`,
        },
        json: true,
      });
    } catch (error) {
      debug(error.message);
      throw error;
    }

    debug('Authentification was successfull');
    const token = new Token(responseBody.access_token, responseBody.expires_in);
    return token;
  }
}

module.exports = Authenticator;
