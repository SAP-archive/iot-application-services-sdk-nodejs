const AssertionUtil = require('../AssertionUtil');
const LeonardoIoT = require('../../lib/LeonardoIoT');

const authorizationUrl = 'https://authorization.cfapps.eu10.hana.ondemand.com';

describe('Authorization Service', () => {
    let client;

    beforeEach(() => {
        client = new LeonardoIoT();
    });

    describe('ObjectGroup', () => {
        it('create', async () => {
            const objectGroupPayload = {Name: 'MyObjectGroup'};
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${authorizationUrl}/ObjectGroups`,
                    method: 'POST',
                    body: objectGroupPayload
                });
            };

            await client.createObjectGroup(objectGroupPayload);
        });

        it('read single', async () => {
            const objectGroupId = 'MyObjectGroup';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${authorizationUrl}/ObjectGroups('${objectGroupId}')`,
                });
            };

            await client.getObjectGroup(objectGroupId);
        });

        it('read multiple', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${authorizationUrl}/ObjectGroups`,
                });
            };

            await client.getObjectGroups();
        });

        it('read root', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${authorizationUrl}/ObjectGroups/TenantRoot`
                });
            };

            await client.getRootObjectGroup();
        });

        it('delete', async () => {
            const objectGroupId = 'MyObjectGroup';
            const etag = '8f9da184-5af1-4237-8ede-a7fee8ddc57e';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${authorizationUrl}/ObjectGroups('${objectGroupId}')`,
                    method: 'DELETE',
                    headers: {'If-Match': etag}
                });
            };

            await client.deleteObjectGroup(objectGroupId, etag);
        });
    });
});
