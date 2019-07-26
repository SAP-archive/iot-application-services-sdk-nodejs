const debug = require('debug')('LeonardoIoT:ConfigurationProvider');
const xsenv = require('@sap/xsenv');

/**
 *  @class ConfigurationProvider
 *  @author: Soeren Buehler
 *  This class identifies and provides different configurations i.e. for authentication from local or server environment
 */
class ConfigurationProvider {
    /**
     * Fetching credentials for authentication in the following order
     * 1) Fetch credentials from user provided service with name "leonardo-iot-sdk"
     * 2) Fetch credentials from service binding of service broker
     * 3) Fetch credentials from local .env file
     * 4) Fetch credentials from environment variables
     * This method is not throwing any error in case no credentials have been found as this library can also be used in a mode in which all access tokens are handled manually
     * @param {String} [serviceName] - name of service which is providing tenant information
     * @returns {{uaaUrl, clientId, clientSecret}|*}
     */
    static getCredentials(serviceName) {
        debug('Fetching authentication options');
        const leonardoIoTService = this._getLeonardoIoTService(serviceName);
        if (leonardoIoTService && leonardoIoTService.credentials) {
            return leonardoIoTService.credentials.uaa;
        }
        return undefined;
    }

    /**
     * Creating a repository of service destination URLs considering the current landscape. Landscape information is fetched in the following order
     * 1) Fetch landscape information from service binding of service broker
     * 2) Fetch landscape information from local .env file
     * 3) Fetch landscape information from environment variables
     *
     * In case no landscape information can be determined the default landscape is EU10.
     * This method returns a key value map where key equals the service name (i.e. appiot-mds) and value equals the full destination URI (i.e. https://appiot-mds.cfapps.eu10.hana.ondemand.com)
     * @param {String} [serviceName] - name of service which is providing tenant information
     * @returns {*}
     */
    static getDestinations(serviceName) {
        debug('Fetching destinations options from service binding');
        const leonardoIoTService = this._getLeonardoIoTService(serviceName);
        if (leonardoIoTService && leonardoIoTService.credentials) {
            return leonardoIoTService.credentials.endpoints;
        }
        return undefined;
    }

    /**
     * Return service object of bound Leonardo IoT service instance if available
     * @param {String} [serviceName] - name of service which is providing tenant information
     * @returns {*}
     * @private
     */
    static _getLeonardoIoTService(serviceName) {
        if (serviceName) {
            return this._getService({name: serviceName})
        }

        return this._getService({tag: 'leonardoiot'});
    }

    /**
     * Return service object of bound XSUAA service instance if available
     * @returns {*}
     */
    static getXsuaaService() {
        return this._getService({tag: 'xsuaa'});
    }

    /**
     * Return service object which fits query parameters
     * @param {String} [name] - filters service by name, selection parameter with highest priority
     * @param {String} [tag] - filters service by tag, selection parameter with lower priority than name
     * @returns {*}
     * @private
     */
    static _getService({name, tag} = {}) {
        xsenv.loadEnv();
        const services = xsenv.readCFServices();

        if (name) {
            return Object.values(services).find(service => service && service.name && service.name === name);
        }
        if (tag) {
            return Object.values(services).find(service => service && service.tags && service.tags.includes(tag));
        }
    }
}

module.exports = ConfigurationProvider;
