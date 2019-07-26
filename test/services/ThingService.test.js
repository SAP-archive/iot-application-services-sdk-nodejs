const AssertionUtil = require('../AssertionUtil');
const LeonardoIoT = require('../../lib/LeonardoIoT');

const appiotMdsUrl = 'https://appiot-mds.cfapps.eu10.hana.ondemand.com';

describe('Thing Service', () => {
    let client;

    beforeEach(() => {
        client = new LeonardoIoT();
    });

    describe('Thing', () => {
        it('create', async () => {
            const thingPayload = {Name: 'MyThing'};
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things`,
                    method: 'POST',
                    body: thingPayload
                });
            };

            await client.createThing(thingPayload);
        });

        it('read single', async () => {
            const thingId = 'MyThing';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things('${thingId}')`,
                });
            };

            await client.getThing(thingId);
        });

        it('read single by alternate identifier', async () => {
            const thingAlternateId = 'MyAlternateThing';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/ThingsByAlternateId('${thingAlternateId}')`,
                });
            };

            await client.getThingByAlternateId(thingAlternateId);
        });

        it('read multiple', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things`,
                });
            };

            await client.getThings();
        });

        it('read multiple with different query parameters', async () => {
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things?$select=_id,_name&$orderby=_id&$top=10&$skip=5`,
                });
            };

            await client.getThings({
                $select: '_id,_name', $orderby: '_id', $top: 10, $skip: 5
            });
        });

        it('read multiple by thing type', async () => {
            const thingTypeId = 'MyThingType';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things?$filter=_thingType eq '${thingTypeId}'`
                });
            };

            await client.getThingsByThingType(thingTypeId);
        });

        it('read multiple by thing type with complex filter', async () => {
            const thingTypeId = 'MyThingType';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things?$filter=_name eq 'test' and _thingType eq '${thingTypeId}'`
                });
            };

            await client.getThingsByThingType(thingTypeId, {$filter: "_name eq 'test'"});
        });

        it('delete', async () => {
            const thingId = 'MyThing';
            client.request = function (requestConfig) {
                AssertionUtil.assertRequestConfig(requestConfig, {
                    url: `${appiotMdsUrl}/Things('${thingId}')`,
                    method: 'DELETE'
                });
            };

            await client.deleteThing(thingId);
        });
    });
});
