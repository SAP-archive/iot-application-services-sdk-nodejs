'use strict'
const request = require('request')
const debug = require('debug')('ae_nodewrapper:requestor')
const Authenticator = require('./../auth/authenticator')
const BaseURI = require('./baseURI')
const Utils = require('./utils')

/**
 * Sends requests (basic and streaming) to AE.
 */
class Requestor {
  /**
   * Inits a new Requestor.
   *
   * @constructor
   * @param {String} tenant - tenant of AE system
   * @param {String} landscape - landscape of AE system
   * @param {String} host - host of AE system
   * @param {String} clientId - id of the oauth client
   * @param {String} clientSecret - secret of the oauth client
   */
  constructor (tenant, landscape, host, clientId, clientSecret) {
    // init the base uri
    this._oBaseURI = new BaseURI(landscape, host) // TODO remove base uri class

    // init the authenticator
    this._authenticator = new Authenticator(tenant, landscape, host, clientId, clientSecret)
  }

  /**
   * Creates a request-object for the API of SAP IoT AE.
   *
   * @param {String} httpMethod - the http method of the request
   * @param {String} uri
   *    - the URI to request
   *    - if a base URI is set, you can just pass the resource-path (+ optional query options)
   * @param {JSON} body - the body of the request (only type JSON supported)
   * @param {JSON} headers - additional headers of the http request
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
  async _getRequest (httpMethod, uri, body, headers) {
    const that = this

    // build the URI to request
    uri = (function () { // TODO optimize
      // check if a full URI is passed
      if (Utils.isValidURI(uri)) return uri

      // check if the base uri is used
      if (that._oBaseURI.getBaseURI() == null) { // a base uri is set?
        const error = new Error('The passed URI is not valid and no base URI is set.')
        debug(error)
        throw error
      }

      if (uri.charAt(0) !== '/') { // is the param a valid resource path?
        const error = new Error("'" + uri + "' is not a valid resource path.")
        debug(error)
        throw error
      }

      return that._oBaseURI.getBaseURI() + uri
    })()

    // get a jwt token
    let accessToken
    try {
      accessToken = await this._authenticator.getAccessToken()
    } catch (error) {
      throw error
    }

    // build the request
    const request = {
      url: uri,
      method: httpMethod,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      json: body
    }

    // add the additional headers to the request
    for (var headerName in headers) {
      request.headers[headerName] = headers[headerName]
    }

    return request
  }

  /**
   * Sends a request to the API of SAP IoT AE and returns the response.
   *
   * @param {String} httpMethod - the http method of the request
   * @param {String} uri
   *    - the URI to request
   *    - if a base URI is set, you can just pass the resource-path (+ optional query options)
   * @param {JSON} body - the body of the request (only type JSON supported)
   * @param {JSON} headers - additional headers of the http request
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
  async sendRequest (httpMethod, uri, body, headers) {
    let request 
    try {
      request = await this._getRequest(httpMethod, uri, body, headers)
    } catch (error) {
      debug(error)
      throw error
    }

    debug('Sending a ' + httpMethod + ' request to ' + uri + '.')
    let response
    try {
      // hier gehts weiter
    }

    var that = this

    return new Promise((resolve, reject) => {
      // get the request-object
      var loadingRequest = that._getRequest(httpMethod, uri, body, headers)

      loadingRequest.then(
        function success (oRequest) { // valid request-object
          // send the request
          debug('Sending a ' + httpMethod + ' request to ' + uri + '.')
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
  openStream (sHttpMethod, sURI, oBody, aHeaders) {
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
  setBaseURI (sMicroservice) {
    return this._oBaseURI.setBaseURI(sMicroservice)
  }

  /**
   * Returns the current base URI.
   *
   * @return {String} sBaseURI - the base URI
   */
  getBaseURI () {
    return this._oBaseURI.getBaseURI()
  }

  /**
   * Deletes the base URI.
   *
   * @return {String} sBaseURI - the removed base URI
   */
  deleteBaseURI () {
    return this._oBaseURI.deleteBaseURI()
  }
}

module.exports = Requestor
