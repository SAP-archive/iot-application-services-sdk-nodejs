const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');

describe('2) READ ALL', () => {
    let client;

    before(async () => {
        client = new LeonardoIoT();
    });

    it('packages', async () => {
        await client.getPackages();
    });

    it('property set types', async () => {
        await client.getPropertySetTypes();
        await client.getPropertySetTypesByPackage(DataHelper.package().Name);
    });

    it('thing types', async () => {
        await client.getThingTypes();
        await client.getThingTypesByPackage(DataHelper.package().Name);
    });

    it('object groups', async () => {
        await client.getObjectGroups();
        const objectGroups = await client.getObjectGroups({
            $filter: `name eq ${DataHelper.objectGroup().name}`
        });
        DataHelper.data.objectGroup = objectGroups.value[0];
    });

    it('things', async () => {
        await client.getThings();
        const things = await client.getThingsByThingType(DataHelper.thingType().Name);
        DataHelper.data.thing = things.value[0];
    });
});
