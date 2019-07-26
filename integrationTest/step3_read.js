const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');

describe('3) READ', () => {
    let client;

    before(async () => {
        client = new LeonardoIoT();
    });

    it('package', async () => {
        await client.getPackage(DataHelper.package().Name);
    });

    it('property set type', async () => {
        await client.getPropertySetType(DataHelper.propertySetType().Name);
    });

    it('thing type', async () => {
        await client.getThingType(DataHelper.thingType().Name);
    });

    it('object group', async function () {
        await client.getObjectGroup(DataHelper.data.objectGroup.objectGroupID);
        await client.getRootObjectGroup();
    });

    it('thing', async function () {
        await client.getThing(DataHelper.data.thing._id);
        await client.getThingByAlternateId(DataHelper.data.thing._alternateId);
    });
});
