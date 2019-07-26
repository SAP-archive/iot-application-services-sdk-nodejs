/**
 * This example shows different package service calls
 */

const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const client = new LeonardoIoT();

let tenantPackagePrefix;

// Entry point of script
(async () => {
    try {
        await determineTenant();
        await runPackageOperations();
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

    tenantPackagePrefix = tenantInfo.value[0].package;
}

async function runPackageOperations() {
    console.log('Start creation of sample packages');

    // Create package
    await client.createPackage({
        Name: `${tenantPackagePrefix}.sdk.sample.package1`,
        Scope: 'private'
    });

    // Copy existing package
    await client.createPackage({
        Name: `${tenantPackagePrefix}.sdk.sample.package2`,
        Scope: 'tenant'
    });

    // Read existing sample packages
    const response = await client.getPackages({
        $filter: `startswith(Name,'${tenantPackagePrefix}.sdk.sample.package')`
    });
    const packages = response.d.results;
    console.log(`Number of existing sample packages: ${packages.length}`);

    for (const packageObject of packages) {
        // Get etag for each package
        const packageResponse = await client.getPackage(packageObject.Name, {resolveWithFullResponse: true});
        // Delete created packages
        await client.deletePackage(packageObject.Name, packageResponse.headers.etag);
        console.log(`Package successfully deleted: ${packageObject.Name}`);
    }
}
