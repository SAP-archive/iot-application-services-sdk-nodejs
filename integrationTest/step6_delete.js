const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');

describe('6) DELETE', () => {
    let client;

    before(async () => {
        client = new LeonardoIoT();
    });

    it('thing', async () => {
        const things = await client.getThingsByThingType(DataHelper.thingType().Name);
        for (const thing of things.value) {
            await client.deleteThing(thing._id);
        }
    });

    it('object group', async () => {
        const objectGroups = await client.getObjectGroups({
            $filter: `name eq ${DataHelper.objectGroup().name}`
        });

        for (const objectGroup of objectGroups.value) {
            await client.deleteObjectGroup(objectGroup.objectGroupID, objectGroup.etag);
        }
    });

    it('thing type', async () => {
        const thingTypeResponse = await client.getThingType(DataHelper.thingType().Name, {}, {resolveWithFullResponse: true});
        await client.deleteThingType(DataHelper.thingType().Name, thingTypeResponse.headers.etag);
    });

    it('property set type', async () => {
        const propertySetTypeResponse = await client.getPropertySetType(DataHelper.propertySetType().Name, {}, {resolveWithFullResponse: true});
        await client.deletePropertySetType(DataHelper.propertySetType().Name, propertySetTypeResponse.headers.etag);
    });

    it('package', async () => {
        const packageResponse = await client.getPackage(DataHelper.package().Name, {resolveWithFullResponse: true});
        await client.deletePackage(DataHelper.package().Name, packageResponse.headers.etag);
    });
});
