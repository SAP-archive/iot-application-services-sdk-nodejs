const querystring = require('querystring');

/** @typedef {Object} RequestConfig
 *  @property {Object} [requestConfig.headers] - custom header fields which enrich the request
 *  @property {Boolean} [requestConfig.resolveWithFullResponse=false] - return full or only body part of the response
 *  @property {String} [requestConfig.jwt] - jwt token used in authorization header field
 */

/**
 *  @class ThingTypeService
 *  @author: Soeren Buehler
 *  Expose functions for most used thing type APIs
 */
class ThingTypeService {
    // TODO jsdoc
    static async createThingType(packageName, payload, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        // TODO v1 or v2?
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/Packages('${packageName}')/ThingTypes`,
            method: 'POST',
            headers,
            body: payload,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read a thing type
     * @param {String} thingTypeName - Thing type identifier
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/affa982fcad54d35a31f6d53a0583bcc.html SAP Help API documentation}
     */
    static async getThingType(thingTypeName, queryParameters = {}, {headers = {}, resolveWithFullResponse = false, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/ThingTypes('${thingTypeName}')${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all thing types filtered by query parameters
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/ecef327f458848b3a136aba3bed17f97.html SAP Help API documentation}
     */
    static async getThingTypes(queryParameters = {}, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/ThingTypes${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Read all thing types for a package
     * @param {String} packageName - Package identifier
     * @param {Object} [queryParameters={}] - Map of query parameters
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/37203cc631694b08a592d7a42146d0ac.html SAP Help API documentation}
     */
    static async getThingTypesByPackage(packageName, queryParameters = {}, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        const queryString = querystring.stringify(queryParameters);
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/Packages('${packageName}')/ThingTypes${queryString ? `?${queryString}` : ''}`,
            headers,
            resolveWithFullResponse,
            jwt
        });
    }

    /**
     * Delete a thing type
     * @param {String} thingTypeName - Thing type identifier
     * @param {String} etag - latest entity tag
     * @param {RequestConfig} [requestConfig] - configuration of request metadata parameters
     * @returns {Promise.<*>} API response
     * @see {@link https://help.sap.com/viewer/080fabc6cae6423fb45fca7752adb61e/latest/en-US/277d0e0c5f214b4c823fd3d0e804710c.html SAP Help API documentation}
     */
    static async deleteThingType(thingTypeName, etag, {headers = {}, resolveWithFullResponse, jwt} = {}) {
        headers['If-Match'] = etag;
        return await this.request({
            url: `${this.navigator.configThing()}/ThingConfiguration/v1/ThingTypes('${thingTypeName}')`,
            method: 'DELETE',
            headers,
            resolveWithFullResponse,
            jwt
        });
    }
}

module.exports = ThingTypeService;
