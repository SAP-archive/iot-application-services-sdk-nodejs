/**
 * This example shows how to read the latest measurements of a single thing and also how to write them directly into the time series store without using the ingestion pipeline.
 *
 * TASKS BEFORE START:
 * - Enter value for variable "thingId"
 */

const assert = require('assert');
const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const client = new LeonardoIoT();

const thingId = ''; // TODO enter thingId used for ingestion
assert(thingId, 'Enter value for variable "thingId" before running this sample');

// Entry point of script
(async () => {
    try {
        await runTimeSeriesDataOperations();
    } catch (err) {
        console.log(err);
    }
})();


async function runTimeSeriesDataOperations() {
    const thing = await client.getThing(thingId);
    const thingType = await client.getThingType(thing._thingType[0], {
        $expand: 'PropertySets/Properties'
    });

    let thingSnapshotData = await client.getThingSnapshot(thingId);
    console.log(`(1) Latest thing snapshot data\n${JSON.stringify(thingSnapshotData)}`);

    // Fetch first time series property set of thing type
    const propertySet = thingType.d.PropertySets.results.filter(propertySet => propertySet.DataCategory === 'TimeSeriesData')[0];

    const timeSeriesDataPayload = generateTimeSeriesDataPayload(propertySet);
    console.log(`\n (2) Sending new time series data:\n${JSON.stringify(timeSeriesDataPayload)}`);
    await client.createTimeSeriesData(thingId, thing._thingType, propertySet.Name, timeSeriesDataPayload);

    thingSnapshotData = await client.getThingSnapshot(thingId);
    console.log(`\n(3) New thing snapshot data:\n${JSON.stringify(thingSnapshotData)}`);
}

function generateTimeSeriesDataPayload(propertySet) {
    // Create time series payload skeleton with current timestamp
    const timeSeriesDataPayload = {
        value: [{
            _time: new Date().toISOString()
        }]
    };

    // Generate test data for properties of property set
    for (const property of propertySet.Properties.results) {
        let value;
        if (property.Type === 'NumericFlexible') {
            value = Math.floor(Math.random() * 100) + 0.5;
        } else if (property.Type === 'Numeric') {
            value = Math.floor(Math.random() * 100);
        } else if (property.Type === 'Boolean') {
            value = Math.random() >= 0.5;
        } else if (property.Type === 'String') {
            value = new Date().toISOString().substring(0, 6);
        }

        if (value) timeSeriesDataPayload.value[0][property.Name] = value;
    }

    return timeSeriesDataPayload;
}