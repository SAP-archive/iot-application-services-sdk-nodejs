/* global describe it beforeEach */
const assert = require('assert');
const nock = require('nock');
const ApplicationEnablement = require('../lib/ApplicationEnablement');

let AE;
const options = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  tenant: 'sap-iotaehandson',
  landscape: 'eu10',
  host: 'hana.ondemand.com',
};

describe('ApplicationEnablement', () => {
  beforeEach(() => {
    AE = new ApplicationEnablement(options);

    nock('https://sap-iotaehandson.authentication.eu10.hana.ondemand.com')
      .post('/oauth/token')
      .reply(function () {
        const credentialsBase64 = Buffer.from(`${options.clientId}:${options.clientSecret}`).toString('base64');
        const requestHeaders = this.req.headers;
        if (requestHeaders.authorization === `Basic ${credentialsBase64}`) {
          return [200, {
            access_token: '12345',
            expires_in: 10000,
          }];
        }
        return [400, 'Bad credentials'];
      });
  });

  describe('request', () => {
    it('get', async () => {
      const body = { Things: [] };
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, body);

      let responseBody;
      try {
        responseBody = await AE.request({
          url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
        });
      } catch (error) {
        throw error;
      }

      assert.equal(JSON.stringify(responseBody), JSON.stringify(body));
    });

    it('post', async () => {
      const payload = {
        basicData: {
          locationID: '759CA6B9C6B0432398DBBDDAC84070A9',
          tenant: 'sap-iotaehandson',
          etag: '1',
        },
        locationData: {
          streetName: 'Hasso-Plattner-Ring',
          houseNumber: '8',
          cityName: 'Walldrof',
          postalCode: '69190',
          country: 'DE',
          longitude: 8.636881,
          latitude: 49.294464,
        },
      };

      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .post('/Locations')
        .reply(201, (url, body) => {
          assert.equal(JSON.stringify(body), JSON.stringify(payload));
          return undefined;
        });

      let responseBody;
      try {
        responseBody = await AE.request({
          method: 'POST',
          url: 'https://location.cfapps.eu10.hana.ondemand.com/Locations',
          body: payload,
        });
      } catch (error) {
        throw error;
      }

      assert.equal(responseBody, undefined);
    });

    it('put', async () => {
      const payload = {
        basicData: {
          locationID: '759CA6B9C6B0432398DBBDDAC84070A9',
          tenant: 'sap-iotaehandson',
          etag: '1',
        },
        locationData: {
          streetName: 'Hasso-Plattner-Ring',
          houseNumber: '8',
          cityName: 'Walldrof',
          postalCode: '69190',
          country: 'DE',
          longitude: 8.636881,
          latitude: 49.294464,
        },
      };

      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .put('/Locations(%27759CA6B9C6B0432398DBBDDAC84070A9%27)')
        .reply(200, (url, body) => {
          assert.equal(JSON.stringify(body), JSON.stringify(payload));
          return 'Successfully changed';
        });

      let responseBody;
      try {
        responseBody = await AE.request({
          method: 'PUT',
          url: "https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')",
          body: payload,
        });
      } catch (error) {
        throw error;
      }

      assert.equal(responseBody, 'Successfully changed');
    });

    it('delete', async () => {
      nock('https://location.cfapps.eu10.hana.ondemand.com')
        .delete('/Locations(%27759CA6B9C6B0432398DBBDDAC84070A9%27)')
        .reply(204, 'success');

      let responseBody;
      try {
        responseBody = await AE.request({
          method: 'DELETE',
          url: "https://location.cfapps.eu10.hana.ondemand.com/Locations('759CA6B9C6B0432398DBBDDAC84070A9')",
        });
      } catch (error) {
        throw error;
      }

      assert.equal(responseBody, 'success');
    });

    it('evaluate the sent request', async () => {
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(function (uri, requestBody) {
          const requestHeaders = this.req.headers;
          assert.equal(JSON.stringify(requestHeaders), JSON.stringify({
            'if-match': '3',
            authorization: 'Bearer 12345',
            host: 'appiot-mds.cfapps.eu10.hana.ondemand.com',
            accept: 'application/json',
            'content-type': 'application/json',
            'content-length': 21,
          }));
          assert.equal(JSON.stringify(requestBody), JSON.stringify({ test: 'test-value' }));
          return '';
        });

      await AE.request({
        method: 'GET',
        url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
        headers: { 'If-Match': '3' },
        body: { test: 'test-value' },
      });
    });

    it('error', async () => {
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(400, 'Error');

      try {
        await AE.request({
          method: 'GET',
          url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
        });
        throw new Error('should not get until here');
      } catch (error) {
        assert.equal(error.message, '400 - "Error"');
      }
    });

    it('auth error', async () => {
      AE.authenticator.clientSecret = 'wrongSecret';

      try {
        await AE.request({
          method: 'GET',
          url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
        });
        throw new Error('should not get until here');
      } catch (error) {
        assert.equal(error.message, '400 - "Bad credentials"');
      }
    });

    it('resolve with full response', async () => {
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, 'Success');

      let response;
      try {
        response = await AE.request({
          method: 'GET',
          url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
          resolveWithFullResponse: true,
        });
      } catch (error) {
        throw error;
      }

      assert.equal(response.statusCode, 200);
      assert.equal(response.body, 'Success');
      assert.equal(JSON.stringify(response.headers), '{}');
    });

    it('get (by only passing the url)', async () => {
      const body = { Things: [] };
      nock('https://appiot-mds.cfapps.eu10.hana.ondemand.com')
        .get('/Things')
        .reply(200, body);

      let responseBody;
      try {
        responseBody = await AE.request('https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things');
      } catch (error) {
        throw error;
      }

      assert.equal(JSON.stringify(responseBody), JSON.stringify(body));
    });
  });
});
