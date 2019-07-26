const AssertionUtil = require('../AssertionUtil');
const LeonardoIoT = require('../../lib/LeonardoIoT');

const configThingUrl = 'https://config-thing-sap.cfapps.eu10.hana.ondemand.com';

describe('Property Set Type Service', () => {
    let client;

    beforeEach(() => {
        client = new LeonardoIoT();
    });

    describe('PropertySetType', () => {
        it('create', async () => {
            const packageName = 'MyPackage';
            const propertySetTypePayload = {Name: 'MyPropertySetType'};
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/Packages('${packageName}')/PropertySetTypes`,
                    method: 'POST',
                    body: propertySetTypePayload
                });
            };

            await client.createPropertySetType(packageName, propertySetTypePayload);
        });

        it('read single', async () => {
            const propertySetTypeName = 'MyPropertySetType';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/PropertySetTypes('${propertySetTypeName}')`,
                });
            };

            await client.getPropertySetType(propertySetTypeName);
        });

        it('read multiple', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/PropertySetTypes`,
                });
            };

            await client.getPropertySetTypes();
        });

        it('read multiple by package', async () => {
            const packageName = 'MyPackage';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/Packages('${packageName}')/PropertySetTypes`,
                });
            };

            await client.getPropertySetTypesByPackage(packageName);
        });

        it('delete', async () => {
            const propertySetTypeName = 'MyPropertySetType';
            const etag = '8f9da184-5af1-4237-8ede-a7fee8ddc57e';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configThingUrl}/ThingConfiguration/v1/PropertySetTypes('${propertySetTypeName}')`,
                    method: 'DELETE',
                    headers: {'If-Match': etag}
                });
            };

            await client.deletePropertySetType(propertySetTypeName, etag);
        });
    });
});
