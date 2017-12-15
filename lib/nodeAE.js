'use strict'
require('dotenv').config()
var Requestor = require('./request/requestor')

/**
 * Creates a new NodeWrapper for the API of SAP IoT AE.
 *
 * @constructor
 */
var nodeAE = module.exports = function (config) {
  var configParams = {}
  if (config) {
        // if the user provides config we check it here. otherwise fallback to the env variables
    var configParamNames = ['clientId', 'clientSecret', 'tenant', 'landscape', 'host']
    configParamNames.forEach((paramName) => {
      if (config[paramName]) configParams[paramName] = config[paramName]
    })
    var keys = Object.keys(configParams)
    if (keys.length === 0) console.log('using env')
    else if (configParamNames.filter(name => !!configParams[name]).length !== configParamNames.length) {
      throw Error(`Incomplete configuration. Configure via env-file or provide all of the following properties: ${configParamNames.join(', ')}`)
    }
  } else {
    // config object not provided. check env variables
    if (!process.env.AE_OAUTH_CLIENT_ID ||
      !process.env.AE_OAUTH_CLIENT_SECRET ||
      !process.env.AE_TENANT ||
      !process.env.AE_LANDSCAPE ||
      !process.env.AE_HOST) {
      throw Error('Not all environment variables are set.')
    }
    configParams = {
      clientId: process.env.AE_OAUTH_CLIENT_ID,
      clientSecret: process.env.AE_OAUTH_CLIENT_SECRET,
      tenant: process.env.AE_TENANT,
      landscape: process.env.AE_LANDSCAPE,
      host: process.env.AE_HOST
    }
  }

  // the config-object
  this._oConfig = {
    sClientId: configParams.clientId,
    sClientSecret: configParams.clientSecret,
    sTenant: configParams.tenant,
    sLandscape: configParams.landscape,
    sHost: configParams.host
  }

  // init the requestor
  this._oRequestor = new Requestor(this._oConfig.sTenant, this._oConfig.sLandscape,
    this._oConfig.sHost, this._oConfig.sClientId, this._oConfig.sClientSecret)
}

/* ============================================================ */
/* Base-URI                                                     */
/* ============================================================ */

/**
 * Sets the base URI of the module. This base URI is contacted for all further requests as long as a new base URI is
 * set or the base URI is removed.
 *
 * @param {String} sMicroservice - the microservice of the API of AE is contacted
 * @return {String} sBaseURI - the new base URI
 *
 * @example
 * var nodeAE = new NodeAE()
 * nodeAE.setBaseURI('appiot-mds')
 * nodeAE.getBaseURI() // https://appiot-mds.cfapps.eu10.hana.ondemand.com
 * nodeAE.get('/Things') // gets all things from https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things
 * nodeAE.deleteBaseURI()
 */
nodeAE.prototype.setBaseURI = function (sMicroservice) {
  this._oRequestor.setBaseURI(sMicroservice)
}

/**
 * Returns the current base URI.
 *
 * @return {String} sBaseURI - the base URI
 */
nodeAE.prototype.getBaseURI = function () {
  return this._oRequestor.getBaseURI()
}

/**
 * Deletes the base URI.
 *
 * @return {String} sBaseURI - the removed base URI
 */
nodeAE.prototype.deleteBaseURI = function () {
  return this._oRequestor.deleteBaseURI()
}

/* ============================================================ */
/* HTTP requests                                                */
/* ============================================================ */

/**
 * Sends a POST request to the API of SAP IoT AE and returns the response.
 *
 * HTTP     Request   Description
 * Create   POST      Creating a new instance of a database entity managed by a service.
 *
 * @param {String} sURI
 * @param {JSON} oBody
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicRequest for further information.
 */
nodeAE.prototype.post = function (sURI, oBody, aHeaders) {
  return this._oRequestor.sendRequest('POST', sURI, oBody, aHeaders)
}

/**
 * Sends a GET request to the API of SAP IoT AE and returns the response.
 *
 * HTTP     Request   Description
 * Read     GET       Retrieve a single instance of a database entity managed by a particular service
 * Read all GET       Retrieve multiple database entities managed by a particular service
 *
 * @param {String} sURI
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicRequest for further information.
 */
nodeAE.prototype.get = function (sURI, aHeaders) {
  return this._oRequestor.sendRequest('GET', sURI, undefined, aHeaders)
}

/**
 * Sends a PUT request to the API of SAP IoT AE and returns the response.
 *
 * HTTP     Request   Description
 * Update   PUT       Modify a database entity managed by a service
 *
 * @param {String} sURI
 * @param {JSON} oBody
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicRequest for further information.
 */
nodeAE.prototype.put = function (sURI, oBody, aHeaders) {
  return this._oRequestor.sendRequest('PUT', sURI, oBody, aHeaders)
}

/**
 * Sends a DELETE request to the API of SAP IoT AE and returns the response.
 *
 * HTTP     Request   Description
 * Delete   DELETE    Delete a database entity managed by a service (logically or physically, depending on the service)
 *
 * @param {String} sURI
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicRequest for further information.
 */
nodeAE.prototype.delete = function (sURI, aHeaders) {
  return this._oRequestor.sendRequest('DELETE', sURI, undefined, aHeaders)
}

/* ============================================================ */
/* Streams                                                      */
/* ============================================================ */

/**
 * Sends a POST request to the API of SAP IoT AE and streams the response.
 *
 * HTTP     Request   Description
 * Create   POST      Creating a new instance of a database entity managed by a service.
 *
 * @param {String} sURI
 * @param {JSON} oBody
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicStream for further information.
 */
nodeAE.prototype.openPostStream = function (sURI, oBody, aHeaders) {
  return this._oRequestor.openStream('POST', sURI, oBody, aHeaders)
}

/**
 * Sends a GET request to the API of SAP IoT AE and streams the response.
 *
 * HTTP     Request   Description
 * Read     GET       Retrieve a single instance of a database entity managed by a particular service
 * Read all GET       Retrieve multiple database entities managed by a particular service
 *
 * @param {String} sURI
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicStream for further information.
 */
nodeAE.prototype.openGetStream = function (sURI, aHeaders) {
  return this._oRequestor.openStream('GET', sURI, undefined, aHeaders)
}

/**
 * Sends a PUT request to the API of SAP IoT AE and streams the response.
 *
 * HTTP     Request   Description
 * Update   PUT       Modify a database entity managed by a service
 *
 * @param {String} sURI
 * @param {JSON} oBody
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicStream for further information.
 */
nodeAE.prototype.openPutStream = function (sURI, oBody, aHeaders) {
  return this._oRequestor.openStream('PUT', sURI, oBody, aHeaders)
}

/**
 * Sends a DELETE request to the API of SAP IoT AE and streams the response.
 *
 * HTTP     Request   Description
 * Delete   DELETE    Delete a database entity managed by a service (logically or physically, depending on the service)
 *
 * @param {String} sURI
 * @param {JSON} aHeaders
 * @return {Promise}
 *
 * @see _basicStream for further information.
 */
nodeAE.prototype.openDeleteStream = function (sURI, aHeaders) {
  return this._oRequestor.openStream('DELETE', sURI, undefined, aHeaders)
}
