/* global describe it */
const assert = require('assert');
const ApplicationEnablement = require('../lib/ApplicationEnablement');

let AE;

describe('ApplicationEnablement', () => {
  describe('new ApplicationEnablement', () => {
    it('with manual config', () => {
      AE = new ApplicationEnablement({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        tenant: 'sap-iotaehandson',
        landscape: 'eu10',
        host: 'hana.ondemand.com',
      });

      assert.equal(AE.clientId, 'clientId');
      assert.equal(AE.clientSecret, 'clientSecret');
      assert.equal(AE.tenant, 'sap-iotaehandson');
      assert.equal(AE.landscape, 'eu10');
      assert.equal(AE.host, 'hana.ondemand.com');
    });

    it('with config via env', () => {
      process.env.AE_OAUTH_CLIENT_ID = 'clientId';
      process.env.AE_OAUTH_CLIENT_SECRET = 'clientSecret';
      process.env.AE_TENANT = 'sap-iotaehandson';
      process.env.AE_LANDSCAPE = 'eu10';
      process.env.AE_HOST = 'hana.ondemand.com';

      AE = new ApplicationEnablement();

      assert.equal(AE.clientId, process.env.AE_OAUTH_CLIENT_ID);
      assert.equal(AE.clientSecret, process.env.AE_OAUTH_CLIENT_SECRET);
      assert.equal(AE.tenant, process.env.AE_TENANT);
      assert.equal(AE.landscape, process.env.AE_LANDSCAPE);
      assert.equal(AE.host, process.env.AE_HOST);
    });

    it('should throw an error as no config is set', () => {
      try {
        delete process.env.AE_OAUTH_CLIENT_ID;
        AE = new ApplicationEnablement();
        throw Error(); // should not go until here
      } catch (err) {
        assert.equal(err.message, 'Incomplete configuration. Configure via env-file or provide all of the following properties: tenant, landscape, host, clientId, clientSecret.');
      }
    });
  });
});
