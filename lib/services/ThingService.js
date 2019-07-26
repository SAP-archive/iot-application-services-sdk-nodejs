const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class ThingService
 *  @author: Soeren Buehler
 *  Expose functions for most used thing APIs
 */
class ThingService {
  /**
     * Create a thing instance based on a thing type
     * @param {Object} payload - request body payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/9cb0266f70604515af1e0197720c9a2f.html SAP Help API documentation}
     */
  static async createThing(payload, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    return await this.request({
      url: `${this.navigator.appiotMds()}/Things`,
      method: 'POST',
      headers,
      body: payload,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read a thing
     * @param {String} thingId - Thing identifier
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/26d8abe9ba2d4c7dbe28828f817f4ddb.html SAP Help API documentation}
     */
  static async getThing(thingId, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    return await this.request({
      url: `${this.navigator.appiotMds()}/Things('${thingId}')`,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read a thing by alternate identifier
     * @param {String} alternateId - Unique thing identifier assigned by the creator of a thing
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} - API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/5b7c9c6f818242b6a61c91330f29ee32.html SAP Help API documentation}
     */
  static async getThingByAlternateId(alternateId, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    return await this.request({
      url: `${this.navigator.appiotMds()}/ThingsByAlternateId('${alternateId}')`,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read all things filtered by query parameters
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} - API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/075566a948d54a9e822f21fea493df8e.html SAP Help API documentation}
     */
  static async getThings(queryParameters = {}, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const queryString = querystring.stringify(queryParameters);
    const url = `${this.navigator.appiotMds()}/Things${queryString ? `?${queryString}` : ''}`;
    return await this.request({
      url,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read all things of thing type filtered by query parameters
     * @param {String} thingTypeId - Thing type identifier / name
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} - API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/075566a948d54a9e822f21fea493df8e.html SAP Help API documentation}
     */
  static async getThingsByThingType(thingTypeId, queryParameters = {}, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    if (queryParameters.$filter) {
      queryParameters.$filter += ` and _thingType eq '${thingTypeId}'`;
    } else {
      queryParameters.$filter = `_thingType eq '${thingTypeId}'`;
    }

    return await this.getThings(queryParameters, { headers, resolveWithFullResponse, jwt });
  }

  /**
     * Delete a thing
     * @param {String} thingId - Thing identifier
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} - API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/1905b/en-US/5902f2914b7548c89d74cc21e7b2fd45.html SAP Help API documentation}
     */
  static async deleteThing(thingId, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    return await this.request({
      url: `${this.navigator.appiotMds()}/Things('${thingId}')`,
      method: 'DELETE',
      headers,
      resolveWithFullResponse,
      jwt
    });
  }
}

module.exports = ThingService;
