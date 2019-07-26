const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class AuthorizationService
 *  @author: Soeren Buehler
 *  Expose functions for most used authorization APIs
 */
class AuthorizationService {
    /**
     * Create an object group
     * @param {Object} payload - request body payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/e92728c05dc845f2b1c924144d99fafa.html SAP Help API documentation}
     */
    static async createObjectGroup(payload, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.authorization()}/ObjectGroups`,
            method: 'POST',
            headers,
            body: payload,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read an object group
     * @param {String} objectGroupId - Object group identifier
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/412d630939394d9e8a7a789e34960a43.html SAP Help API documentation}
     */
    static async getObjectGroup(objectGroupId, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.authorization()}/ObjectGroups('${objectGroupId}')`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all object groups filtered by query parameters
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/aa8575ed8b7b42cf99b9144be620126a.html SAP Help API documentation}
     */
    static async getObjectGroups(queryParameters = {}, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.authorization()}/ObjectGroups${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read the root object group
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/9764513e0fd540f09108e365d82f947c.html SAP Help API documentation}
     */
    static async getRootObjectGroup({headers = {}, resolveWithFullResponse, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.authorization()}/ObjectGroups/TenantRoot`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Delete an object group
     * @param {String} objectGroupId - object group identifier
     * @param {String} etag - latest entity tag
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/7981e6ec75554624b2004e82f7ed7add.html SAP Help API documentation}
     */
    static async deleteObjectGroup(objectGroupId, etag, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        headers['If-Match'] = etag;
        return await this.request({
            url: `${this.navigator.authorization()}/ObjectGroups('${objectGroupId}')`,
            method: 'DELETE',
            headers,
            resolveWithFullResponse,
            jwt
        });
    }
}

module.exports = AuthorizationService;
