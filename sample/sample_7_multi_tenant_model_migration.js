/**
 * This sample shows how multiple Leonardo IoT clients for different tenants / subaccounts can be created and used for data migration.
 * In this scenario we have a source (quality assurance) and a target (development) tenant for model migration.
 * All packages and property set types are replicated from the source (quality assurance) tenant to the target (development) tenant.
 *
 * TASKS BEFORE START:
 * - Provide user provided services in 'default-env.json' file containing service keys for two different tenants.
 * In this sample they are called 'leonardo-iot-account-dev' and 'leonardo-iot-account-qa', but feel free to adapt these names to your scenario.
 */

const LeonardoIoT = require('@sap/leonardo-iot-sdk');
// Client for DEV tenant fetching configuration from user provided service with name 'leonardo-iot-account-dev'
const clientDev = new LeonardoIoT('leonardo-iot-account-dev');
// Client for QA tenant fetching configuration from user provided service with name 'leonardo-iot-account-qa'
const clientQa = new LeonardoIoT('leonardo-iot-account-qa');

let sourceTenantPrefix;
let targetTenantPrefix;

// Entry point of script
(async () => {
    try {
        await determineTenantPrefixes(clientQa, clientDev);
        await copyPackages(clientQa, clientDev);
    } catch (err) {
        console.log(err);
    }
})();

async function determineTenantPrefixes(sourceClient, targetClient) {
    sourceTenantPrefix = (await sourceClient.request({
        url: `${clientQa.navigator.businessPartner()}/Tenants`
    })).value[0].package;

    targetTenantPrefix = (await targetClient.request({
        url: `${clientDev.navigator.businessPartner()}/Tenants`
    })).value[0].package;
}

async function copyPackages(sourceClient, targetClient) {
    const sourcePackages = await sourceClient.getPackages();
    for (const sourcePackage of sourcePackages.d.results) {
        const targetPackageName = sourcePackage.Name.replace(sourceTenantPrefix, targetTenantPrefix);

        let existingPackage;
        try {
            existingPackage = await targetClient.getPackage(targetPackageName);
        } catch (err) {
        }

        if (!existingPackage) {
            await targetClient.createPackage({
                Name: targetPackageName,
                Description: sourcePackage.Description,
                Scope: sourcePackage.Scope,
                Status: sourcePackage.Status
            });
        }

        await copyPropertySetTypes(sourceClient, targetClient, sourcePackage.Name, targetPackageName);
    }
}

async function copyPropertySetTypes(sourceClient, targetClient, sourcePackageName, targetPackageName) {
    const sourcePropertySetTypesResponse = await sourceClient.getPropertySetTypesByPackage(sourcePackageName);
    const sourcePropertySetTypes = sourcePropertySetTypesResponse.d.results;

    // Order property set types that reference property set types get created last
    sourcePropertySetTypes.sort((a, b) => ((a.DataCategory === 'ReferencePropertyData') ? 1 : ((b.DataCategory === 'ReferencePropertyData') ? -1 : 0)));

    for (const sourcePropertySetType of sourcePropertySetTypes) {
        const targetPropertySetTypeName = sourcePropertySetType.Name.replace(sourceTenantPrefix, targetTenantPrefix);

        let existingPropertySetType;
        try {
            existingPropertySetType = await targetClient.getPropertySetType(targetPropertySetTypeName);
        } catch (err) {
        }

        if (existingPropertySetType) continue;

        // Create payload for new property set type
        const payload = {
            Name: targetPropertySetTypeName,
            DataCategory: sourcePropertySetType.DataCategory,
            Properties: [],
            Annotations: []
        };

        // Set reference property set type
        if (sourcePropertySetType.ReferredPropertySetType) {
            payload.ReferredPropertySetType = sourcePropertySetType.ReferredPropertySetType.replace(sourceTenantPrefix, targetTenantPrefix);
        }

        // Add properties
        let expandedProperties = await sourceClient.getPropertySetType(sourcePropertySetType.Name, {'$expand': 'Properties'});
        for (const sourceProperty of expandedProperties.d.Properties.results) {
            sourceProperty.PropertySetType = sourceProperty.PropertySetType.replace(sourceTenantPrefix, targetTenantPrefix);

            if (sourceProperty.ReferenceProperty) {
                payload.Properties.push({
                    Name: sourceProperty.Name,
                    AttributeType: sourceProperty.AttributeType,
                    ReferenceProperty: sourceProperty.ReferenceProperty
                });
            } else {
                payload.Properties.push({
                    Name: sourceProperty.Name,
                    Type: sourceProperty.Type,
                    Description: sourceProperty.Description,
                    PropertyLength: sourceProperty.PropertyLength,
                    UnitOfMeasure: sourceProperty.UnitOfMeasure,
                    QualityCode: sourceProperty.QualityCode
                });
            }
        }

        // Add descriptions
        let expandedDescriptions = await sourceClient.getPropertySetType(sourcePropertySetType.Name, {'$expand': 'Descriptions'});
        payload.Descriptions = expandedDescriptions.d.Descriptions.results;

        // Add annotations
        let expandedAnnotations = await sourceClient.getPropertySetType(sourcePropertySetType.Name, {'$expand': 'Annotations'});
        for (const sourceAnnotation of expandedAnnotations.d.Annotations.results) {
            payload.Annotations.push({
                Name: sourceAnnotation.Name,
                PackageName: sourceAnnotation.PackageName
            })
        }

        await targetClient.createPropertySetType(targetPackageName, payload);
    }
}