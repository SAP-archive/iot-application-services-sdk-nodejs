const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class PackageService
 *  @author: Soeren Buehler
 *  Expose functions for most used package APIs
 */
class PackageService {
    /**
     * Create a package
     * @param {Object} payload - request body payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/72815137035e48e0ac38e50934e718df.html SAP Help API documentation}
     */
    static async createPackage(payload, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.configPackage()}/Package/v1/Packages`,
            method: 'POST',
            headers,
            body: payload,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read a package
     * @param {String} packageName - Package identifier
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/9dca46391c5246f7905663364ad00d1f.html SAP Help API documentation}
     */
    static async getPackage(packageName, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.configPackage()}/Package/v1/Packages('${packageName}')`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all packages filtered by query parameters
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/cc532659dbaf4d2ab0afa86b863e4be6.html SAP Help API documentation}
     */
    static async getPackages(queryParameters = {}, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        const url = `${this.navigator.configPackage()}/Package/v1/Packages${queryString ? `?${queryString}` : ''}`;
        return await this.request({
            url,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Delete a package
     * @param {String} packageName - Package identifier
     * @param {String} etag - latest entity tag
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/ba27c0634a3c4208898672e8ac6562e3.html SAP Help API documentation}
     */
    static async deletePackage(packageName, etag, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        headers['If-Match'] = etag;
        return await this.request({
            url: `${this.navigator.configPackage()}/Package/v1/Packages('${packageName}')`,
            method: 'DELETE',
            headers,
            resolveWithFullResponse,
            jwt
        });
    }
}

module.exports = PackageService;
