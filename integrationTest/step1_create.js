const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');

describe('1) CREATE', () => {
    let client;

    before(async () => {
        client = new LeonardoIoT();
    });

    it('package', async () => {
        await client.createPackage(DataHelper.package());
    });

    it('property set type', async () => {
        await client.createPropertySetType(DataHelper.package().Name, DataHelper.propertySetType());
    });

    it('thing type', async () => {
        await client.createThingType(DataHelper.package().Name, DataHelper.thingType());
    });

    it('object group', async () => {
        await client.createObjectGroup(DataHelper.objectGroup());
    });

    it('thing', async () => {
        await client.createThing(DataHelper.thing());
    });
});
