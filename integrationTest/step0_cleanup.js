const LeonardoIoT = require('../lib/LeonardoIoT');
const DataHelper = require('./helper/DataHelper');
const requestHelper = require('./helper/requestHelper');

describe('0) Cleanup and prepare', () => {
    let client;

    before(async () => {
        client = new LeonardoIoT();
        await DataHelper.init(client);
    });

    it('cleanup', async () => {
        let packageExists;
        try {
            packageExists = await client.getPackage(DataHelper.package().Name);
        } catch (err) {
        }

        if (packageExists) {
            await requestHelper.deletePackageCascading(client, DataHelper.package().Name);
        }

        let objectGroups = [];
        try {
            const objectGroupResponse = await client.getObjectGroups({
                $filter: `name eq ${DataHelper.objectGroup().name}`
            });
            objectGroups = objectGroupResponse.value;
        } catch (err) {
        }

        for (const objectGroup of objectGroups) {
            await client.deleteObjectGroup(objectGroup.objectGroupID, objectGroup.etag);
        }
    });
});
