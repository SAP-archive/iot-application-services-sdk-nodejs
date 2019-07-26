const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class TimeSeriesColdStoreService
 *  @author: Soeren Buehler
 *  Expose functions for most used time series cold store APIs
 */
class TimeSeriesColdStoreService {

  /**
     * Create time series data of a thing beyond retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Object} payload - time series data payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/e9bde3d929b64c64bacbf7c3fa9b0aef.html SAP Help API documentation}
     */
  static async createColdStoreTimeSeriesData(thingId, thingTypeName, propertySetId, payload, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const url = `${this.navigator.appiotColdstore()}/Things('${thingId}')/${thingTypeName}/${propertySetId}`;
    return await this.request({
      url,
      method: 'PUT',
      headers,
      body: payload,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read time series data of a thing beyond retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Date} fromTime - From timestamp in ISO8601 format used for data selection
     * @param {Date} toTime - To timestamp in ISO8601 format used for data selection
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>}
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/0c4cd3c27bbc4e84a49ce4b32e3e3887.html SAP Help API documentation}
     */
  static async getColdStoreTimeSeriesData(thingId, thingTypeName, propertySetId, fromTime, toTime, queryParameters = {}, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    queryParameters.timerange = `${fromTime}-${toTime}`;
    const queryString = querystring.stringify(queryParameters);
    return await this.request({
      url: `${this.navigator.appiotColdstore()}/Things('${thingId}')/${thingTypeName}/${propertySetId}?${queryString}`,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Delete time series data of a thing beyond retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Date} fromTime - From timestamp in ISO8601 format used for data selection
     * @param {Date} toTime - To timestamp in ISO8601 format used for data selection
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>}
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/61a76ced9ce647f88ee24648493aeb9b.html SAP Help API documentation}
     */
  static async deleteColdStoreTimeSeriesData(thingId, thingTypeName, propertySetId, fromTime, toTime, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const queryString = querystring.stringify({
      timerange: `${fromTime}-${toTime}`
    });
    return await this.request({
      url: `${this.navigator.appiotColdstore()}/Things('${thingId}')/${thingTypeName}/${propertySetId}?${queryString}`,
      method: 'DELETE',
      headers,
      resolveWithFullResponse,
      jwt
    });
  }
}

module.exports = TimeSeriesColdStoreService;
