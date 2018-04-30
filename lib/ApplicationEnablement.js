require('dotenv').config();
const rp = require('request-promise-native');
const debug = require('debug')('ae_nodewrapper:ApplicationEnablement');
const Authenticator = require('./auth/Authenticator');
const utils = require('./utils/utils');

/** Class acting as a NodeWrapper of SAP IoT Application Enablement. */
class ApplicationEnablement {
  /**
   * Create a NodeWrapper.
   * @constructor
   * @param {Object} config - The config of the NodeWrapper.
   * @param {string} config.tenant - The tenant of SAP IoT Application Enablement.
   * @param {string} config.landscape - The landscape of the SAP IoT Application Enablement tenant.
   * @param {string} config.host - The host of the SAP IoT Application Enablement tenant.
   * @param {string} config.clientId - The OAuth user of the SAP IoT Application Enablement tenant.
   * @param {string} config.clientSecret - The OAuth secret of the SAP IoT Application Enablement
   * tenant.
   */
  constructor({
    tenant, landscape, host, clientId, clientSecret,
  } = {}) {
    // if the user provides config, we check it here. otherwise fallback to the env variables.
    if (tenant && landscape && host && clientId && clientSecret) {
      this.tenant = tenant;
      this.landscape = landscape;
      this.host = host;
      this.clientId = clientId;
      this.clientSecret = clientSecret;
    } else if (process.env.AE_OAUTH_CLIENT_ID && process.env.AE_OAUTH_CLIENT_SECRET &&
      process.env.AE_TENANT && process.env.AE_LANDSCAPE && process.env.AE_HOST) {
      this.tenant = process.env.AE_TENANT;
      this.landscape = process.env.AE_LANDSCAPE;
      this.host = process.env.AE_HOST;
      this.clientId = process.env.AE_OAUTH_CLIENT_ID;
      this.clientSecret = process.env.AE_OAUTH_CLIENT_SECRET;
    } else {
      throw Error('Incomplete configuration. Configure via env-file or provide all of the following properties: tenant, landscape, host, clientId, clientSecret.');
    }

    this.authenticator = new Authenticator({
      tenant: this.tenant,
      landscape: this.landscape,
      host: this.host,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });
    this.baseUrl = undefined;
  }

  /**
   * Set the base url. This url is used for all further requests as long as a no new base url is
   * set or the bas url is removed.
   * @param {string} microservice - The default microservice for further requests.
   * @return {string} The new base url.
   *
   * @example
   * const AE = new ApplicationEnablement()
   * AE.setBaseUrl('appiot-mds')
   * AE.getBaseUrl() // https://appiot-mds.cfapps.eu10.hana.ondemand.com
   * AE.request({ url: '/Things' }) // gets all things from https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things
   * AE.deleteBaseUrl()
   */
  setBaseUrl(microservice) {
    debug('Trying to set a new base URI');
    const MICROSERVICES = [
      'business-partner', 'location', 'authorization', 'tenant-administration', 'appcore-conf',
      'appiot-mds', 'appiot-coldstore', 'analytics-thing-sap', 'appiot-thing-hierarchy', 'appiot-tes',
      'composite-things', 'composite-things-odata', 'composite-events-odata']; // a list of all available microservices

    // check if the passed microservice is available
    if (!MICROSERVICES.includes(microservice)) {
      throw Error('Unknown microservice');
    }

    // set the base url
    this.baseUrl = `https://${microservice}.cfapps.${this.landscape}.${this.host}`;
    debug(`Set base URI to ${this.baseUrl}`);

    return this.baseUrl;
  }

  /**
   * Get the base url.
   * @return {string} The base url.
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Delete the base url.
   * @return {string} The old base url.
   */
  deleteBaseUrl() {
    const oldBaseUrl = this.getBaseUrl();
    this.baseUrl = undefined;
    return oldBaseUrl;
  }

  /**
   * Sends a http request to Application Enablement.
   * @param {Object} requestConfig - The request configuration.
   * @param {string} requestConfig.url - The url / resource path of the request.
   * @param {string} requestConfig.method - The http model of the request.
   * @param {Object} requestConfig.headers - The headers of the request.
   * @param {Object} requestConfig.body - The JSON body of the request.
   * @param {boolean} requestConfig.resolveWithFullResponse - If set to `true`,
   * the full response is returned (not just the respopnse body).
   * @return {object} The response.
   */
  async request(requestConfig) {
    let {
      url, method, headers, body, resolveWithFullResponse,
    } = {};

    // destructuring of the request params
    if (typeof requestConfig === 'string') { // only the url is passed
      url = requestConfig;
      method = 'GET';
    } else {
      ({
        url, method, headers, body, resolveWithFullResponse,
      } = requestConfig);
    }

    debug(`Sending a ${method} request to ${url}`);

    let accessToken;
    try {
      accessToken = await this.authenticator.getAccessToken();
    } catch (error) {
      throw error;
    }

    let response;
    try {
      response = await rp({
        url: this.getRequestUrl(url),
        method,
        headers: { ...headers, Authorization: `Bearer ${accessToken}` },
        body,
        json: true,
        resolveWithFullResponse,
      });
    } catch (error) {
      debug(error.message);
      throw error;
    }

    return response;
  }

  /**
   * Retrieves the url to request.
   * @param {string} resourcePath - The url or resource path to request.
   * @return {string} The request url.
   */
  getRequestUrl(resourcePath) {
    // check if a full url is passed
    if (utils.isValidUrl(resourcePath)) {
      return resourcePath;
    }

    // check if the base url is used
    if (this.getBaseUrl() == null) { // a base uri is set?
      const error = new Error('The passed url is not valid and no base url is set.');
      debug(error.message);
      throw error;
    }

    if (resourcePath.charAt(0) !== '/') { // is the param a valid resource path?
      const error = new Error(`'${resourcePath}' is not a valid resource path.`);
      debug(error.message);
      throw error;
    }

    return this.getBaseUrl() + resourcePath;
  }
}

module.exports = ApplicationEnablement;
