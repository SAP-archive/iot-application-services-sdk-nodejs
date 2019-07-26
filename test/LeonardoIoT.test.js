const assert = require('assert');
const AssertionUtil = require('./AssertionUtil');
const LeonardoIoT = require('../lib/LeonardoIoT');

const forwardedAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const generatedAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gSmFjayIsImlhdCI6MTUxNjIzOTAyMn0.bomrLBN9zEDjVwnPDB49FtIbWxdyHZsnV8OibfTuArs';

describe('LeonardoIoT', () => {
    let client;
    let tmpVcapServices;

    beforeEach(() => {
        client = new LeonardoIoT();
        tmpVcapServices = JSON.parse(JSON.stringify(process.env.VCAP_SERVICES));
    });

    afterEach(() => {
        process.env.VCAP_SERVICES = JSON.parse(JSON.stringify(tmpVcapServices));
    });

    describe('constructor', () => {
        it('supports call without parameter', async () => {
            const clientDefault = new LeonardoIoT();
            assert.notEqual(clientDefault, undefined, 'Invalid constructor for LeonardoIoT client');
        });

        it('supports instances for multi tenant mode', async () => {
            const clientTest = new LeonardoIoT('leonardo-iot-account-test');
            const clientDev = new LeonardoIoT('leonardo-iot-account-dev');

            assert.notEqual(clientTest.authenticator.authUrl, clientDev.authenticator.authUrl, 'Mismatching client ID of clients');
            assert.notEqual(clientTest.authenticator.clientId, clientDev.authenticator.clientId, 'Mismatching client ID of clients');
            assert.notEqual(clientTest.authenticator.clientSecret, clientDev.authenticator.clientSecret, 'Mismatching client ID of clients');
        });
    });

    describe('Request', () => {
        it('has default parameters', async () => {
            client._request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
                    method: 'GET',
                    headers: {Authorization: `Bearer ${forwardedAccessToken}`},
                    body: {},
                    agentOptions: {},
                    resolveWithFullResponse: false
                });
            };

            client.request({
                url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
                jwt: forwardedAccessToken
            });
        });

        it('throws error for missing URL parameter', async () => {
            try {
                await LeonardoIoT._request({url: null});
                assert.fail('Expected Error was not thrown');
            } catch (err) {
                assert.equal(err.message, 'URL argument is empty for "request" call in Leonardo IoT', 'Unexpected error message');
            }
        });
    });

    describe('JWT token', () => {
        it('gets forwarded correctly', async () => {
            client._request = async function (requestConfig) {
                const expectedJwt = `Bearer ${forwardedAccessToken}`;
                assert.equal(requestConfig.headers.authorization(), expectedJwt, 'Unexpected JWT token forwarding');
            };

            client.request({
                url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
                jwt: forwardedAccessToken
            });
        });

        it('gets sliced and forwarded correctly', async () => {
            client._request = async function (requestConfig) {
                const expectedJwt = `Bearer ${forwardedAccessToken}`;
                assert.equal(requestConfig.headers.authorization(), expectedJwt, 'Unexpected JWT token forwarding');
            };

            client.request({
                url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things',
                jwt: `bearer ${forwardedAccessToken}`
            });
        });

        it('gets fetched from authentication URL for request', async () => {
            client.authenticator.getAccessToken = function () {
                return generatedAccessToken;
            };

            client._request = async function (requestConfig) {
                const expectedJwt = `Bearer ${generatedAccessToken}`;
                assert.equal(requestConfig.headers.authorization(), expectedJwt, 'Unexpected JWT token forwarding');
            };

            client.request({
                url: 'https://appiot-mds.cfapps.eu10.hana.ondemand.com/Things'
            });
        });
    });
});
