const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class PropertySetTypeService
 *  @author: Soeren Buehler
 *  Expose functions for most used property set type APIs
 */
class PropertySetTypeService {
    /**
     * Create a property set type
     * @param {String} packageName - package identifier
     * @param {Object} payload - request body payload
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/7e40790cad924439be08981c745f615b.html SAP Help API documentation}
     */
    static async createPropertySetType(packageName, payload, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/Packages('${packageName}')/PropertySetTypes`,
            method: 'POST',
            headers,
            body: payload,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read a property set type
     * @param {String} propertySetTypeName - property set type identifier
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/28da5cd388cf4ed587c4cc4c7cc72e79.html SAP Help API documentation}
     */
    static async getPropertySetType(propertySetTypeName, queryParameters = {}, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/PropertySetTypes('${propertySetTypeName}')${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all property set types filtered by query parameters
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/c5d84a80d41c4a3faa960e252ad62a62.html SAP Help API documentation}
     */
    static async getPropertySetTypes(queryParameters = {}, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/PropertySetTypes${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all property set types for a package
     * @param {String} packageName - Package identifier
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>}
     *  @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/134ada8a73714e89a2f15877730b527a.html SAP Help API documentation}
     */
    static async getPropertySetTypesByPackage(packageName, queryParameters = {}, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/Packages('${packageName}')/PropertySetTypes${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     *
     * @param {String} propertySetTypeName - property set type identifier
     * @param {String} etag - latest entity tag
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/c6db6b10f3494380bf25d2fd3376c43d.html SAP Help API documentation}
     */
    static async deletePropertySetType(propertySetTypeName, etag, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        headers['If-Match'] = etag;
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/PropertySetTypes('${propertySetTypeName}')`,
            method: 'DELETE',
            headers,
            resolveWithFullResponse,
            jwt
        });
    }
}

module.exports = PropertySetTypeService;
