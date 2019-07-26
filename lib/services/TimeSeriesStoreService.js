const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class TimeSeriesStoreService
 *  @author: Soeren Buehler
 *  Expose functions for most used time series store APIs
 */
class TimeSeriesStoreService {
  /**
     * Create time series data of a thing within retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Object} payload - time series data payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/a71c33f350d543429420611b37d74422.html SAP Help API documentation}
     */
  static async createTimeSeriesData(thingId, thingTypeName, propertySetId, payload, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const url = `${this.navigator.appiotMds()}/Things('${thingId}')/${thingTypeName}/${propertySetId}`;
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
     * Read time series data of a thing within retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>}
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/1aac0e3ce4c3474e912e12c4565d991a.html SAP Help API documentation}
     */
  static async getTimeSeriesData(thingId, thingTypeName, propertySetId, queryParameters = {}, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const queryString = querystring.stringify(queryParameters);
    return await this.request({
      url: `${this.navigator.appiotMds()}/Things('${thingId}')/${thingTypeName}/${propertySetId}${queryString ? `?${queryString}` : ''}`,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Read snapshot data of a thing
     * @param {String} thingId / alternateId - Thing identifier /  Unique thing identifier assigned by the creator of a thing
     * @param {String} [dataCategory='']  - Filter for data category
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/650d94e61d7c487e9f16052938dabba9.html SAP Help API documentation}
     */
  static async getThingSnapshot(thingId, dataCategory = '', { headers = {}, resolveWithFullResponse, jwt } = {}) {
    return await this.request({
      url: `${this.navigator.appiotMds()}/Snapshot(thingId='${thingId}',fromTime='',dataCategory='${dataCategory}')`,
      headers,
      resolveWithFullResponse,
      jwt
    });
  }

  /**
     * Delete time series data of a thing within retention period
     * @param {String} thingId - Thing identifier
     * @param {String} thingTypeName - Thing type name
     * @param {String} propertySetId - Property set identifier
     * @param {Date} fromTime - From timestamp in ISO8601 format used for data selection
     * @param {Date} toTime - To timestamp in ISO8601 format used for data selection
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>}
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/f818538640ae44c786299a4156902176.html SAP Help API documentation}
     */
  static async deleteTimeSeriesData(thingId, thingTypeName, propertySetId, fromTime, toTime, { headers = {}, resolveWithFullResponse, jwt } = {}) {
    const queryString = querystring.stringify({
      timerange: `${fromTime}-${toTime}`
    });
    return await this.request({
      url: `${this.navigator.appiotMds()}/Things('${thingId}')/${thingTypeName}/${propertySetId}?${queryString}`,
      method: 'DELETE',
      headers,
      resolveWithFullResponse,
      jwt
    });
  }
}

module.exports = TimeSeriesStoreService;
