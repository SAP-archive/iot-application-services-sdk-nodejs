const AssertionUtil = require('../AssertionUtil');
const LeonardoIoT = require('../../lib/LeonardoIoT');

const configPackageUrl = 'https://config-package-sap.cfapps.eu10.hana.ondemand.com';

describe('Package Service', () => {
    let client;

    beforeEach(() => {
        client = new LeonardoIoT();
    });

    describe('Package', () => {
        it('create', async () => {
            const packagePayload = {Name: 'MyPackage'};
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configPackageUrl}/Package/v1/Packages`,
                    method: 'POST',
                    body: packagePayload
                });
            };

            await client.createPackage(packagePayload);
        });

        it('read single', async () => {
            const packageName = 'MyPackage';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configPackageUrl}/Package/v1/Packages('${packageName}')`,
                });
            };

            await client.getPackage(packageName);
        });

        it('read multiple', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configPackageUrl}/Package/v1/Packages`,
                });
            };

            await client.getPackages();
        });

        it('delete', async () => {
            const packageName = 'MyPackage';
            const etag = '8f9da184-5af1-4237-8ede-a7fee8ddc57e';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${configPackageUrl}/Package/v1/Packages('${packageName}')`,
                    method: 'DELETE',
                    headers: {'If-Match': etag}
                });
            };

            await client.deletePackage(packageName, etag);
        });
    });
});
