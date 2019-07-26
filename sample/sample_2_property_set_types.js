/**
 * This example shows different property set type service calls
 */

const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const client = new LeonardoIoT();

let packageName;

// Entry point of script
(async () => {
    try {
        await determineTenant();
        await setup();
        await runPropertySetTypeOperations();
        await cleanup();
    } catch (err) {
        console.log(err);
    }
})();

/*
 * Identify current operating tenant and add prefix to package name
 */
async function determineTenant() {
    const tenantInfo = await client.request({
        url: `${client.navigator.businessPartner()}/Tenants`
    });

    packageName = `${tenantInfo.value[0].package}.sdk.sample.package`;
}

/*
 * Create package for new property set types
 */
async function setup() {
    console.log('SETUP: Create sample package');
    await client.createPackage({
        Name: packageName,
        Scope: 'private'
    });
}

async function runPropertySetTypeOperations() {
    console.log('Start creation of sample property set types');

    // Create property set type for master data
    await client.createPropertySetType(packageName, {
        Name: `${packageName}:General`,
        DataCategory: 'MasterData',
        Properties: [{Name: 'Vendor', Type: 'String'}]
    });

    // Create property set type for time series data
    await client.createPropertySetType(packageName, {
        Name: `${packageName}:Measurements`,
        DataCategory: 'TimeSeriesData',
        Properties: [{Name: 'Temperature', Type: 'Numeric'}, {Name: 'Pressure', Type: 'NumericFlexible'}]
    });

    // Read existing sample property set types
    const response = await client.getPropertySetTypesByPackage(packageName);
    const propertySetTypes = response.d.results;

    // Read property set type details
    console.log(`Number of existing property set types in sample package: ${propertySetTypes.length}`);

    for (const propertySetType of propertySetTypes) {
        // Get etag for each package
        const propertySetTypeResponse = await client.getPropertySetType(propertySetType.Name, {resolveWithFullResponse: true});
        // Delete created packages
        await client.deletePropertySetType(propertySetType.Name, propertySetTypeResponse.headers.etag);
        console.log(`Property Set Type successfully deleted: ${propertySetType.Name}`);
    }
}

/*
 * Delete newly created package
 */
async function cleanup() {
    console.log('CLEANUP: Delete sample package');
    const packageResponse = await client.getPackage(packageName, {resolveWithFullResponse: true});
    await client.deletePackage(packageName, packageResponse.headers.etag);
}
