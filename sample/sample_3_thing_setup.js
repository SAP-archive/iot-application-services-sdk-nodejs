/**
 * This example shows the creation of a full configuration (package, property set type and thing type).
 * Next this configuration is used to instantiate a single thing, which now can be used for further operations like data ingestion of time series read.
 *
 * After successful operation of the mentioned steps, the cleanup will remove all created definitions so the script can be executed multiple times without manual cleanup.
 * Feel free to skip the cleanup function to keep created test data.
 */

const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const client = new LeonardoIoT();

let packagePayload;
let propertySetTypePayload;
let
    thingTypePayload;

// Entry point of script
(async () => {
    try {
        await preparePayloads();
        await createConfiguration();
        await createThing();
        await cleanup();
    } catch (err) {
        console.log(err);
    }
})();


async function preparePayloads() {
    const tenantInfo = await client.request({
        url: `${client.navigator.businessPartner()}/Tenants`
    });

    const packageName = `${tenantInfo.value[0].package}.sdk.sample`;
    packagePayload = {
        Name: packageName,
        Scope: 'private'
    };
    propertySetTypePayload = {
        Name: `${packageName}:RotorBladeMeasurements`,
        DataCategory: 'TimeSeriesData',
        Properties: [{Name: 'RotationSpeed', Type: 'NumericFlexible'}, {Name: 'Angle', Type: 'Numeric'}]
    };
    thingTypePayload = {
        Name: `${packageName}:WindTurbine`,
        PropertySets: [
            {Name: 'RotorBlade1', PropertySetType: `${packageName}:RotorBladeMeasurements`},
            {Name: 'RotorBlade2', PropertySetType: `${packageName}:RotorBladeMeasurements`},
            {Name: 'RotorBlade3', PropertySetType: `${packageName}:RotorBladeMeasurements`}
        ]
    };
}

/**
 * Creation of configuration entities package, property set type and thing type
 */
async function createConfiguration() {
    await client.createPackage(packagePayload);
    console.log(`Package created: ${packagePayload.Name}`);
    await client.createPropertySetType(packagePayload.Name, propertySetTypePayload);
    console.log(`Property set type created: ${propertySetTypePayload.Name}`);
    await client.createThingType(packagePayload.Name, thingTypePayload);
    console.log(`Thing type created: ${thingTypePayload.Name}`);
}

/**
 * Creation of thing using created configuration of previous step
 */
async function createThing() {
    const rootObjectGroup = await client.getRootObjectGroup();
    const thingPayload = {
        _name: 'SampleThing',
        _description: {
            en: 'Sample thing created with SAP Leonardo IoT SDK'
        },
        _thingType: [thingTypePayload.Name],
        _objectGroup: rootObjectGroup.objectGroupID
    };

    const createThingResponse = await client.createThing(thingPayload, {resolveWithFullResponse: true});
    const thingId = createThingResponse.headers.location.split('\'')[1];
    console.log(`Thing created: ${thingId}`);
}

/**
 * Cleanup of configuration and all related thing instances
 */
async function cleanup() {
    const packageResponse = await client.getPackage(packagePayload.Name, {resolveWithFullResponse: true});
    const propertySetTypeResponse = await client.getPropertySetType(propertySetTypePayload.Name, {resolveWithFullResponse: true});
    const thingTypeResponse = await client.getThingType(thingTypePayload.Name, null, {resolveWithFullResponse: true});

    const things = await client.getThingsByThingType(thingTypePayload.Name);
    for (const thing of things.value) {
        await client.deleteThing(thing._id);
        console.log(`Thing deleted: ${thing._id}`);
    }

    await client.deleteThingType(thingTypePayload.Name, thingTypeResponse.headers.etag);
    console.log(`Thing type deleted: ${thingTypePayload.Name}`);
    await client.deletePropertySetType(propertySetTypePayload.Name, propertySetTypeResponse.headers.etag);
    console.log(`Property set type deleted: ${propertySetTypePayload.Name}`);
    await client.deletePackage(packagePayload.Name, packageResponse.headers.etag);
    console.log(`Package deleted: ${packagePayload.Name}`);
}