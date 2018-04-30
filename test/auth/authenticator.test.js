/* global describe it beforeEach */
const assert = require('assert');
const nock = require('nock');
const Authenticator = require('./../../lib/auth/Authenticator');

let authenticator;

describe('authenticator', () => {
  beforeEach(() => {
    authenticator = new Authenticator({
      tenant: 'test',
      landscape: 'eu10',
      host: 'hana.ondemand.com',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
    });
  });

  describe('getAccessToken', () => {
    it('should return a token', async () => {
      nock('https://test.authentication.eu10.hana.ondemand.com')
        .post('/oauth/token')
        .reply(200, {
          access_token: '98723dsfsdf',
          expires_in: 1000,
        });

      const token = await authenticator.getAccessToken();
      assert.equal(token, '98723dsfsdf');
    });

    it('should only return a new token if the stored token is expired', async () => {
      nock('https://test.authentication.eu10.hana.ondemand.com')
        .post('/oauth/token')
        .reply(200, {
          access_token: '98723dsfsdf',
          expires_in: -1000,
        });

      nock('https://test.authentication.eu10.hana.ondemand.com')
        .post('/oauth/token')
        .reply(200, {
          access_token: '98723dsfsdf2',
          expires_in: 1000,
        });

      let token = await authenticator.getAccessToken();
      assert.equal(token, '98723dsfsdf');

      token = await authenticator.getAccessToken();
      assert.equal(token, '98723dsfsdf2');

      token = await authenticator.getAccessToken();
      assert.equal(token, '98723dsfsdf2');
    });
  });

  describe('getNewToken', () => {
    it('should return a new token', async () => {
      nock('https://test.authentication.eu10.hana.ondemand.com')
        .post('/oauth/token')
        .reply(function (uri, requestBody) {
          assert.equal(this.req.headers['content-type'], 'application/x-www-form-urlencoded');
          assert.equal(this.req.headers.authorization, 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0');
          assert.equal(requestBody, 'grant_type=client_credentials&response_type=token');
          return [200, {
            access_token: '98723dsfsdf',
            expires_in: -1000,
          }];
        });

      const token = await authenticator.getNewToken();
      assert.equal(token.getAccessToken(), '98723dsfsdf');
    });

    it('should return an error', async () => {
      nock('https://test.authentication.eu10.hana.ondemand.com')
        .post('/oauth/token')
        .replyWithError('something awful happened');

      try {
        await authenticator.getNewToken();
        throw new Error();
      } catch (error) {
        assert.equal(error.message, 'Error: something awful happened');
      }
    });
  });
});
