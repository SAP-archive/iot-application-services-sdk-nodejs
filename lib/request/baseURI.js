'use strict'
var debug = require('debug')('ae_nodewrapper:baseURI')

/**
 * Stores a base uri for contacting AE. This base URI is contacted for all further requests as long as a new base URI is
 * set or the base URI is removed.
 *
 * @param {String} sLandscape - landscape of AE tenant
 * @param {String} sHost - host of the AE tenant
 *
 * @constructor
 */
var baseURI = module.exports = function (sLandscape, sHost) {
  this._sLandscape = sLandscape
  this._sHost = sHost
  this._sBaseURI = null
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
baseURI.prototype.setBaseURI = function (sMicroservice) {
  debug('Trying to set a new base URI.')
  const MICROSERVICES = [
    'business-partner', 'location', 'authorization', 'tenant-administration', 'appcore-conf',
    'appiot-mds', 'appiot-coldstore', 'analytics-thing-sap', 'appiot-thing-hierarchy', 'appiot-tes',
    'composite-things', 'composite-things-odata', 'composite-events-odata'] // a list of all available microservices

  // check if the passed microservice is available
  if (MICROSERVICES.indexOf(sMicroservice) === -1) {
    throw Error('Unknown microservice.')
  }

  // set the base URI
  var sURI = 'https://' + sMicroservice + '.cfapps.' + this._sLandscape + '.' + this._sHost
  this._sBaseURI = sURI
  debug('Set base URI to ' + sURI)

  return sURI
}

/**
 * Returns the current base URI.
 *
 * @return {String} sBaseURI - the base URI
 */
baseURI.prototype.getBaseURI = function () {
  return this._sBaseURI
}

/**
 * Deletes the base URI.
 *
 * @return {String} sBaseURI - the removed base URI
 */
baseURI.prototype.deleteBaseURI = function () {
  var sURI = this.getBaseURI()
  this._sBaseURI = undefined
  return sURI
}
