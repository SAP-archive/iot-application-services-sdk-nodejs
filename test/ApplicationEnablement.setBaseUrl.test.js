/* global describe it beforeEach */
const assert = require('assert');
const ApplicationEnablement = require('../lib/ApplicationEnablement');

describe('ApplicationEnablement', () => {
  beforeEach(() => {
    process.env.AE_OAUTH_CLIENT_ID = 'clientId';
    process.env.AE_OAUTH_CLIENT_SECRET = 'clientSecret';
    process.env.AE_TENANT = 'sap-iotaehandson';
    process.env.AE_LANDSCAPE = 'eu10';
    process.env.AE_HOST = 'hana.ondemand.com';
  });

  describe('setBaseUrl', () => {
    it('a valid microservice', () => {
      const microservice = 'location';
      const correctBaseUrl = `https://${microservice}.cfapps.${process.env.AE_LANDSCAPE}.${process.env.AE_HOST}`;

      const AE = new ApplicationEnablement();
      AE.setBaseUrl(microservice);

      assert.equal(AE.baseUrl, correctBaseUrl);
    });

    it('invalid microservice', () => {
      const AE = new ApplicationEnablement();

      try {
        AE.setBaseUrl('locations'); // wrong (plural)
        throw Error(); // should not go until here
      } catch (err) {
        assert.equal(err.message, 'Unknown microservice');
      }
    });
  });

  describe('getBaseUrl', () => {
    it('should return the base url', () => {
      const AE = new ApplicationEnablement();
      AE.baseUrl = 'something';
      assert.equal(AE.getBaseUrl(), 'something');
    });
  });

  describe('deleteBaseUrl', () => {
    it('should delete the base url', () => {
      const AE = new ApplicationEnablement();
      AE.baseUrl = 'something';
      AE.deleteBaseUrl();
      assert.equal(AE.baseUrl, undefined);
    });
  });
});
