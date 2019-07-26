const rp = require('request-promise-native');
const debug = require('debug')('LeonardoIoT');
const Authenticator = require('./auth/Authenticator');
const PackageService = require('./services/PackageService');
const PropertySetTypeService = require('./services/PropertySetTypeService');
const ThingTypeService = require('./services/ThingTypeService');
const AuthorizationService = require('./services/AuthorizationService');
const ThingService = require('./services/ThingService');
const TimeSeriesStoreService = require('./services/TimeSeriesStoreService');
const TimeSeriesColdStoreService = require('./services/TimeSeriesColdStoreService');
const Navigator = require('./utils/Navigator');
const ConfigurationProvider = require('./utils/ConfigurationProvider');

/**
 * @class LeonardoIoT
 * Class acting as a SAP Leonardo IoT client
 * @Property {ThingService} this.thing - Service for thing related API calls
 * @Property {ConfigurationService} this.configuration - Service for configuration related API calls
 * @Property {AuthorizationService} this.authorization - Service for authorization related API calls
 * @Property {TimeSeriesStoreService} this.timeSeriesStore - Service for time series store related API calls
 * */
class LeonardoIoT {
    /**
     * Create a SAP Leonardo IoT client
     * @constructor
     * @param {String} [serviceName] - name of service which contains your SAP Leonardo IoT service key
     * @returns {LeonardoIoT}
     */
    constructor(serviceName) {
        this.authenticator = new Authenticator(ConfigurationProvider.getCredentials(serviceName), ConfigurationProvider.getXsuaaService());
        this.navigator = new Navigator(serviceName);

        // Package
        this.createPackage = PackageService.createPackage.bind(this);
        this.getPackage = PackageService.getPackage.bind(this);
        this.getPackages = PackageService.getPackages.bind(this);
        this.deletePackage = PackageService.deletePackage.bind(this);

        // Property Set Type
        this.createPropertySetType = PropertySetTypeService.createPropertySetType.bind(this);
        this.getPropertySetType = PropertySetTypeService.getPropertySetType.bind(this);
        this.getPropertySetTypes = PropertySetTypeService.getPropertySetTypes.bind(this);
        this.getPropertySetTypesByPackage = PropertySetTypeService.getPropertySetTypesByPackage.bind(this);
        this.deletePropertySetType = PropertySetTypeService.deletePropertySetType.bind(this);

        // Thing Type
        this.createThingType = ThingTypeService.createThingType.bind(this);
        this.getThingType = ThingTypeService.getThingType.bind(this);
        this.getThingTypes = ThingTypeService.getThingTypes.bind(this);
        this.getThingTypesByPackage = ThingTypeService.getThingTypesByPackage.bind(this);
        this.deleteThingType = ThingTypeService.deleteThingType.bind(this);

        // Object Group
        this.createObjectGroup = AuthorizationService.createObjectGroup.bind(this);
        this.getObjectGroup = AuthorizationService.getObjectGroup.bind(this);
        this.getObjectGroups = AuthorizationService.getObjectGroups.bind(this);
        this.getRootObjectGroup = AuthorizationService.getRootObjectGroup.bind(this);
        this.deleteObjectGroup = AuthorizationService.deleteObjectGroup.bind(this);

        // Thing
        this.createThing = ThingService.createThing.bind(this);
        this.getThing = ThingService.getThing.bind(this);
        this.getThingByAlternateId = ThingService.getThingByAlternateId.bind(this);
        this.getThings = ThingService.getThings.bind(this);
        this.getThingsByThingType = ThingService.getThingsByThingType.bind(this);
        this.deleteThing = ThingService.deleteThing.bind(this);

        // Time Series Store
        this.createTimeSeriesData = TimeSeriesStoreService.createTimeSeriesData.bind(this);
        this.getTimeSeriesData = TimeSeriesStoreService.getTimeSeriesData.bind(this);
        this.getThingSnapshot = TimeSeriesStoreService.getThingSnapshot.bind(this);
        this.deleteTimeSeriesData = TimeSeriesStoreService.deleteTimeSeriesData.bind(this);

        // Time Series Cold Store
        this.createColdStoreTimeSeriesData = TimeSeriesColdStoreService.createColdStoreTimeSeriesData.bind(this);
        this.getColdStoreTimeSeriesData = TimeSeriesColdStoreService.getColdStoreTimeSeriesData.bind(this);
        this.deleteColdStoreTimeSeriesData = TimeSeriesColdStoreService.deleteColdStoreTimeSeriesData.bind(this);
    }

    /**
     * Sends a http request to SAP Leonardo IoT
     * @param {Object} requestConfig - The request configuration
     * @param {string} requestConfig.url - The url / resource path of the request
     * @param {string} [requestConfig.method='GET'] - The http method of the request
     * @param {Object} [requestConfig.headers] - The headers of the request
     * @param {Object} [requestConfig.body] - The JSON body of the request.
     * @param {boolean} [requestConfig.resolveWithFullResponse=false] - If set to `true`, the full response is returned (not just the response body).
     * @param {string} requestConfig.jwt - Access token used in authorization header field
     * @return {object} The response.
     */
    async request({
                      url, method = 'GET', headers = {}, body = {}, agentOptions = {}, resolveWithFullResponse = false, jwt
                  } = {}) {
        jwt = await this._manageJWTAuthorization(jwt);
        headers.Authorization = `Bearer ${jwt}`;

        return await LeonardoIoT._request({
            url,
            method,
            headers,
            body,
            agentOptions,
            resolveWithFullResponse,
            json: true
        });
    }

    /**
     * Evaluate access token if existing. Else a new one will be fetched.
     * @param {String} [accessToken] - forwarded access token
     * @returns {Promise.<*>}
     * @private
     */
    async _manageJWTAuthorization(accessToken) {
        if (accessToken) {
            debug('Using given access token for authorization');
            accessToken = accessToken.startsWith('Bearer') || accessToken.startsWith('bearer') ? accessToken.slice(6, accessToken.length).trim() : accessToken;
            return await this.authenticator.exchangeToken(accessToken);
        }
        debug('Fetching access token from authenticator');
        return await this.authenticator.getAccessToken();
    }

    /**
     * Forward request to backend
     * @param {Object} requestConfig - The request configuration
     * @returns {Promise.<*>}
     * @private
     */
    static async _request(requestConfig) {
        if (!requestConfig.url) {
            throw new Error('URL argument is empty for "request" call in Leonardo IoT');
        }

        debug(`Sending a ${requestConfig.method} request to ${requestConfig.url}`);
        return await rp(requestConfig);
    }
}

module.exports = LeonardoIoT;
