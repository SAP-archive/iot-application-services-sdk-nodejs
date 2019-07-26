const requestHelper = require('./requestHelper');

class DataHelper {
    static async init(client) {
        DataHelper.client = client;
        DataHelper.tenantPrefix = await requestHelper.determineTenantPrefix(client);
        DataHelper.rootObjectGroup = await client.getRootObjectGroup();
        DataHelper.data = {};
    }

    static package() {
        return {
            Name: `${DataHelper.tenantPrefix}.leonardo.iot.sdk.it`,
            Scope: 'private'
        };
    }

    static propertySetType() {
        return {
            Name: `${DataHelper.package().Name}:TestPropertySetTypeSDK`,
            DataCategory: 'TimeSeriesData',
            Properties: [{Name: 'Temperature', Type: 'Numeric'}]
        };
    }

    static thingType() {
        return {
            Name: `${DataHelper.package().Name}:TestThingTypeSDK`,
            PropertySets: [
                {Name: 'TestPropertySet', PropertySetType: `${DataHelper.package().Name}:TestPropertySetTypeSDK`}
            ]
        };
    }

    static objectGroup() {
        return {
            name: 'TestObjectGroupSDK',
            objectGroupParentID: DataHelper.rootObjectGroup.objectGroupID
        };
    }

    static thing() {
        return {
            _name: 'TestThingSDK',
            _alternateId: 'TestThingSDK',
            _description: {en: 'TestThingSDK'},
            _thingType: [DataHelper.thingType().Name],
            _objectGroup: DataHelper.rootObjectGroup.objectGroupID
        };
    }
}

module.exports = DataHelper;
