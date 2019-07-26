/**
 * This example shows how to interact as sending IoT Service device using a MQTT or REST gateway
 *
 * TASKS BEFORE START:
 * - Enter IoT Services credentials to access device certificate
 * - Enter value for variable "deviceAlternateId"
 * - Enter value for variable "sensorAlternateId"
 * - Enter value for variable "capabilityAlternateId"
 * - Adapt measurement payload content to your current capability definition
 */

const assert = require('assert');
const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const IoTServiceHelper = require('./helper/IoTServicesHelper');
const client = new LeonardoIoT();

const iotServicesCredentials = {
  host: '', // TODO enter IoT Services Host (without https:// protocol)
  tenant: '', // TODO enter IoT Services Tenant
  user: '', // TODO enter IoT Services User
  password: '' // TODO enter IoT Services Password
};
const helper = new IoTServiceHelper(iotServicesCredentials);

const deviceAlternateId = ''; // TODO enter alternateId of device
const sensorAlternateId = ''; // TODO enter alternateId of sensor
const capabilityAlternateId = ''; // TODO enter alternateId of capability
assert(deviceAlternateId && sensorAlternateId && capabilityAlternateId, 'Enter values for variables "deviceAlternateId", "sensorAlternateId" and "capabilityAlternateId" before running this sample');

// Entry point of script
(async () => {
    try {
        await sendData();
    } catch (err) {
        console.log(err);
    }
})();


function generateMeasurementPayload() {
  const payload = {};
  // TODO adapt measurement payload to your IoT Services Capability model
  payload.temperature = Math.floor(Math.random() * 50);
  payload.humidity = Math.floor(Math.random() * 50);
  return payload;
}

async function sendData() {
  const device = await helper.getDeviceByAlternateId(deviceAlternateId);
  const gateway = await helper.getGateway(device.gatewayId);

  // Sending sample test data for measurements with current timestamp
  const now = new Date();
  const measurementPayload = generateMeasurementPayload();

  if (gateway.protocolId === 'mqtt') {
    await helper.ingestDataMqtt(deviceAlternateId, sensorAlternateId, capabilityAlternateId, measurementPayload, now);
  } else if (gateway.protocolId === 'rest') {
    await helper.ingestDataRest(deviceAlternateId, sensorAlternateId, capabilityAlternateId, measurementPayload, now);
  } else {
    throw new Error(`Unsupported protocol for this sample: ${gateway.protocolId}`);
  }

  console.log(`Successfully sent data with timestamp ${now.toISOString()} for device ${deviceAlternateId}: ${JSON.stringify(measurementPayload)}`);

  const sensor = await helper.getSensorByAlternateId(sensorAlternateId);
  const assignments = await client.request({
    url: `${client.navigator.tmDataMapping()}/v1/assignments?sensorId=${sensor.id}`
  });

  if (assignments && assignments.length === 1) {
    await _sleep(20000);
    const snapshot = await client.getThingSnapshot(assignments[0].thingId);
    console.log(JSON.stringify(snapshot));
  } else {
    console.log(`No thing assignment found for sensor ${sensorAlternateId}`);
  }
}

async function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
