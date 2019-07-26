const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');

describe('5) DATA', () => {
    let client;
    let thingTypeName;
    let propertySetName;
    let thingId;

    const currentTime = new Date().toISOString();
    const oneYearAgoTime = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();

    before(async () => {
        client = new LeonardoIoT();
    });

    describe('5.1) TIME SERIES COLD STORE', () => {
        before(async () => {
            thingTypeName = DataHelper.thingType().Name;
            propertySetName = DataHelper.thingType().PropertySets[0].Name;
            thingId = DataHelper.data.thing._id;
        });

        it('create', async () => {
            await client.createTimeSeriesData(thingId, thingTypeName, propertySetName, {
                value: [{
                    _time: currentTime,
                    Temperature: 25
                }]
            });
        });

        it('read', async () => {
            await client.getTimeSeriesData(thingId, thingTypeName, propertySetName);
        });

        it('read snapshot', async () => {
            await client.getThingSnapshot(thingId);
        });

        it('delete', async () => {
            await client.deleteTimeSeriesData(thingId, thingTypeName, propertySetName, currentTime, currentTime);
        });
    });

    describe('5.2) TIME SERIES COLD STORE', () => {
        before(async () => {
            thingTypeName = DataHelper.thingType().Name;
            propertySetName = DataHelper.thingType().PropertySets[0].Name;
            thingId = DataHelper.data.thing._id;
        });

        it('create', async () => {
            await client.createColdStoreTimeSeriesData(thingId, thingTypeName, propertySetName, {
                value: [{
                    _time: oneYearAgoTime,
                    Temperature: 28
                }]
            });
        });

        it('read', async () => {
            await client.getColdStoreTimeSeriesData(thingId, thingTypeName, propertySetName, oneYearAgoTime, oneYearAgoTime);
        });

        it('delete', async () => {
            await client.deleteColdStoreTimeSeriesData(thingId, thingTypeName, propertySetName, oneYearAgoTime, oneYearAgoTime);
        });
    });
});
