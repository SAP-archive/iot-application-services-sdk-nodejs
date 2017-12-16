'use strict'
var request = require('request')
var debug = require('debug')('ae_nodewrapper:requestor')
var Authenticator = require('./auth/authenticator')
var BaseURI = require('./baseURI')
var Utils = require('./utils')

/**
 * Sends requests (basic and streaming) to AE.
 *
 * @param {String} sTenant - tenant of AE system
 * @param {String} sLandscape - landscape of AE system
 * @param {String} sHost - host of AE system
 * @param {String} sClientId - id of the oauth client
 * @param {String} sClientSecret - secret of the oauth client
 *
 * @constructor
 */
var requestor = module.exports = function (sTenant, sLandscape, sHost, sClientId, sClientSecret) {
  // init the base uri
  this._oBaseURI = new BaseURI(sLandscape, sHost)

  // init the authenticator
  var sAuthUrl = 'https://' + sTenant + '.authentication.' + sLandscape + '.' + sHost + '/oauth/token'
  this._oAuthenticator = new Authenticator(sClientId, sClientSecret, sAuthUrl)
}

/**
 * Creates a request-object for the API of SAP IoT AE.
 *
 * @param {String} sHttpMethod - the http method of the request
 * @param {String} sURI
 *    - the URI to request
 *    - if a base URI is set, you can just pass the resource-path (+ optional query options)
 * @param {JSON} oBody - the body of the request (only type JSON supported)
 * @param {JSON} aHeaders - additional headers of the http request
 * @return {Promise} oResponse  - resolved with the request-object / reject in case of an error
 *
 * @example
 * var nodeAE = new NodeAE()
 *
 * nodeAE.setBaseURI('appiot-mds')
 * var loadingRequest = nodeAE._getRequest('GET', '/Things')
 *
 * loadingRequest.then(
 *   function success (oRequest) { // valid request-object
 *     // ...
 *   },
 *   function error (oError) { // no valid request-object
 *     // ...
 *   }
 * )
 */
requestor.prototype._getRequest = function (sHttpMethod, sURI, oBody, aHeaders) {
  var that = this
  var err

  return new Promise((resolve, reject) => {
    // request the access-token
    var loadingAccessToken = that._oAuthenticator.getAccessToken()

    // call the API
    loadingAccessToken.then(
      function success (sToken) {
        // build the URI to request
        sURI = (function () {
          // check if a full URI is passed
          if (Utils.isValidURI(sURI)) return sURI

          // check if the base uri is used
          if (that._oBaseURI.getBaseURI() == null) { // a base uri is set?
            err = new Error('The passed URI is not valid and no base URI is set.')
            debug(err)
            reject(err)
          }

          if (sURI.charAt(0) !== '/') { // is the param a valid resource path?
            err = new Error("'" + sURI + "' is not a valid resource path.")
            debug(err)
            reject(err)
          }

          return that._oBaseURI.getBaseURI() + sURI
        })()

        // build the request
        var oRequest = {
          url: sURI,
          method: sHttpMethod,
          headers: {
            'Authorization': 'Bearer ' + sToken
          },
          json: oBody
        }

        // add the additional headers to the request
        for (var sHeader in aHeaders) {
          oRequest.headers[sHeader] = aHeaders[sHeader]
        }

        // return the request
        resolve(oRequest)
      },
      function error (oError) {
        reject(oError)
      })
  })
}

/**
 * Sends a request to the API of SAP IoT AE and returns the response.
 *
 * @param {String} sHttpMethod - the http method of the request
 * @param {String} sURI
 *    - the URI to request
 *    - if a base URI is set, you can just pass the resource-path (+ optional query options)
 * @param {JSON} oBody - the body of the request (only type JSON supported)
 * @param {JSON} aHeaders - additional headers of the http request
 * @return {Promise} oResponse  - resolved / rejected with the response from the API
 *
 * @example
 * var nodeAE = new NodeAE()
 *
 * nodeAE.setBaseURI('appiot-mds')
 * nodeAE._basicRequest('GET', /Things') // gets all things from https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things
 *
 * nodeAE._basicRequest('GET', 'https://location.cfapps.eu10.hana.ondemand.com/Locations') // ignores the base URI (as a valid URI is passed)
 */
requestor.prototype.sendRequest = function (sHttpMethod, sURI, oBody, aHeaders) {
  var that = this

  return new Promise((resolve, reject) => {
    // get the request-object
    var loadingRequest = that._getRequest(sHttpMethod, sURI, oBody, aHeaders)

    loadingRequest.then(
      function success (oRequest) { // valid request-object
        // send the request
        debug('Sending a ' + sHttpMethod + ' request to ' + sURI + '.')
        request(oRequest, function handleResponse (oError, oResponse) {
          // handle errors
          if (oError) {
            reject(oError)
            return
          }

          // handle all non-successfull status-codes
          if (oResponse.statusCode < 200 || oResponse.statusCode > 299) {
            reject(oResponse)
            return
          }

          resolve(oResponse)
        })
      },
      function error (oError) { // no valid request-object
        reject(oError)
      }
    )
  })
}

/**
 * Opens a stream to the API of SAP IoT AE.
 *
 * @param {String} sHttpMethod - the http method of the request
 * @param {String} sURI
 *    - the URI to request
 *    - if a base URI is set, you can just pass the resource-path (+ optional query options)
 * @param {JSON} oBody - the body of the request (only type JSON supported)
 * @param {JSON} aHeaders - additional headers of the http request
 * @return {Promise} oResponse  - resolved / rejected with the response from the API
 *
 * @example
 * var nodeAE = new NodeAE()
 *
 * nodeAE.setBaseURI('appiot-mds')
 *
 * var loadingStream = nodeAE._basicStream('GET', '/Things')
 * loadingStream.then(
 *   function success (stream) {
 *     stream.pipe(fs.createWriteStream('./output.txt')) // will write all Things to 'output.txt'
 *   },
 *   function error (err) {
 *     console.log(err)
 *   }
 * )
 */
requestor.prototype.openStream = function (sHttpMethod, sURI, oBody, aHeaders) {
  var that = this

  return new Promise((resolve, reject) => {
    // get the request-object
    var loadingRequest = that._getRequest(sHttpMethod, sURI, oBody, aHeaders)

    loadingRequest.then(
      function success (oRequest) { // valid request-object
        // send the request
        debug('Opening a ' + sHttpMethod + ' stream to ' + sURI + '.')
        var oStream = request(oRequest)
        resolve(oStream)
      },
      function error (oError) { // no valid request-object
        reject(oError)
      }
    )
  })
}

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
requestor.prototype.setBaseURI = function (sMicroservice) {
  return this._oBaseURI.setBaseURI(sMicroservice)
}

/**
 * Returns the current base URI.
 *
 * @return {String} sBaseURI - the base URI
 */
requestor.prototype.getBaseURI = function () {
  return this._oBaseURI.getBaseURI()
}

/**
 * Deletes the base URI.
 *
 * @return {String} sBaseURI - the removed base URI
 */
requestor.prototype.deleteBaseURI = function () {
  return this._oBaseURI.deleteBaseURI()
}
