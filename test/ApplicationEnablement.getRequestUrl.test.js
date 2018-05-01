/* global describe it beforeEach */
const assert = require('assert');
const ApplicationEnablement = require('../lib/ApplicationEnablement');

let AE;

describe('ApplicationEnablement', () => {
  beforeEach(() => {
    AE = new ApplicationEnablement({
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      tenant: 'sap-iotaehandson',
      landscape: 'eu10',
      host: 'hana.ondemand.com',
    });
  });

  describe('getRequestUrl', () => {
    it('should use the base url', () => {
      AE.setBaseUrl('appiot-mds');
      const url = AE.getRequestUrl('/test');
      assert.equal(url, `${AE.getBaseUrl()}/test`);
    });

    it('should not use the base url as a valid URI is passed', () => {
      AE.setBaseUrl('appiot-mds');
      const url = 'https://location.cfapps.eu10.hana.ondemand.com/test';
      assert.equal(AE.getRequestUrl(url), url);
    });

    it('should throw an error as a non-valid url is passed and base url is not set', () => {
      try {
        AE.getRequestUrl('ps.eu10.hana.ondemand.com/test');
        throw new Error(); // should not get until here
      } catch (error) {
        assert.equal(error.message, 'The passed url is not valid and no base url is set.');
      }
    });
  });
});
