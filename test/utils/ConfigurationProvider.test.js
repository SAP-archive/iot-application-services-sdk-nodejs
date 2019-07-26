const assert = require('assert');
const ConfigurationProvider = require('../../lib/utils/ConfigurationProvider');

describe('ConfigurationProvider', () => {
    let tmpVcapServices;

    describe('Authentication', () => {
        beforeEach(() => {
            tmpVcapServices = JSON.parse(JSON.stringify(process.env.VCAP_SERVICES));
        });

        afterEach(() => {
            process.env.VCAP_SERVICES = JSON.parse(JSON.stringify(tmpVcapServices));
        });

        it('getCredentials from service broker service', async () => {
            process.env.VCAP_SERVICES = '{"iotae":[{"name":"internal","credentials":{"uaa":{"url":"ServiceBrokerUaaUrl","clientid":"ServiceBrokerClientId","clientsecret":"ServiceBrokerClientSecret"}},"tags":["leonardoiot"]}]}';

            const authentication = ConfigurationProvider.getCredentials();
            assert.equal(authentication.url, 'ServiceBrokerUaaUrl', 'Unexpected UAA url');
            assert.equal(authentication.clientid, 'ServiceBrokerClientId', 'Unexpected Client ID');
            assert.equal(authentication.clientsecret, 'ServiceBrokerClientSecret', 'Unexpected Client secret');
        });

        it('getCredentials without any settings', async () => {
            process.env.VCAP_SERVICES = '{}';
            const authentication = ConfigurationProvider.getCredentials();
            assert(authentication === undefined, 'Unexpected return value');
        });
    });

    describe('Destination', () => {
        beforeEach(() => {
            tmpVcapServices = JSON.parse(JSON.stringify(process.env.VCAP_SERVICES));
            process.env.VCAP_SERVICES = '{}';
        });

        afterEach(() => {
            process.env.VCAP_SERVICES = JSON.parse(JSON.stringify(tmpVcapServices));
        });

        it('getDestinations from environment', async () => {
            process.env.VCAP_SERVICES = '{"iotae":[{"credentials":{"endpoints":{"appiot-mds":"https://appiot-mds-backup.cfapps.de01.hana.ondemand.com"}},"tags":["leonardoiot"]}]}';

            const destinations = ConfigurationProvider.getDestinations();
            assert.equal(destinations['appiot-mds'], 'https://appiot-mds-backup.cfapps.de01.hana.ondemand.com', 'Unexpected destination');
        });

        it('getDestinations without any settings', async () => {
            process.env.VCAP_SERVICES = '{}';
            const authentication = ConfigurationProvider.getDestinations();
            assert(authentication === undefined, 'Unexpected return value');
        });
    });

    describe('getService filter', () => {
        it('get existing service by tag', async () => {
            const service = ConfigurationProvider._getService({tag: 'leonardoiot'});
            assert.equal(service.tags[0], 'leonardoiot', 'Unexpected service');
        });

        it('get not existing service by tag', async () => {
            const service = ConfigurationProvider._getService({tag: 'notExisting'});
            assert.equal(service, undefined, 'Unexpected service');
        });

        it('get existing service by name', async () => {
            const service = ConfigurationProvider._getService({name: 'iot_internal'});
            assert.equal(service.name, 'iot_internal', 'Unexpected service');
        });

        it('get existing user provided service by name', async () => {
            const service = ConfigurationProvider._getService({name: 'leonardo-iot-account-test'});
            assert.equal(service.name, 'leonardo-iot-account-test', 'Unexpected service');
        });

        it('get not existing service by name', async () => {
            const service = ConfigurationProvider._getService({name: 'notExisting'});
            assert.equal(service, undefined, 'Unexpected service');
        });
    });
});
