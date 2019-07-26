const AssertionUtil = require('../AssertionUtil');
const LeonardoIoT = require('../../lib/LeonardoIoT');

const configThingUrl = 'https://config-thing-sap.cfapps.eu10.hana.ondemand.com';

describe('Thing Type Service', () => {
    let client;

    beforeEach(() => {
        client = new LeonardoIoT();
    });

    describe('ThingType', () => {
        it('create', async () => {
            const packageName = 'MyPackage';
            const thingTypePayload = {Name: 'MyThingType'};
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/Packages('${packageName}')/ThingTypes`,
                    method: 'POST',
                    body: thingTypePayload
                });
            };

            await client.createThingType(packageName, thingTypePayload);
        });

        it('read single', async () => {
            const thingTypeName = 'MyThingType';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/ThingTypes('${thingTypeName}')`,
                });
            };

            await client.getThingType(thingTypeName);
        });

        it('read multiple', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/ThingTypes`,
                });
            };

            await client.getThingTypes();
        });

        it('read multiple by package', async () => {
            const packageName = 'MyPackage';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/Packages('${packageName}')/ThingTypes`,
                });
            };

            await client.getThingTypesByPackage(packageName);
        });

        it('delete', async () => {
            const thingTypeName = 'MyThingType';
            const etag = '8f9da184-5af1-4237-8ede-a7fee8ddc57e';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/ThingTypes('${thingTypeName}')`,
                    method: 'DELETE',
                    headers: {'If-Match': etag}
                });
            };

            await client.deleteThingType(thingTypeName, etag);
        });
    });
});
