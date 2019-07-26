const debug = require('debug')('LeonardoIoT:Sample:IoTServicesHelper');
const assert = require('assert');
const rp = require('request-promise-native');
const mqtt = require('async-mqtt');

class IoTServicesHelper {
  constructor(iotServicesCredentials) {
    assert(iotServicesCredentials.host && iotServicesCredentials.tenant && iotServicesCredentials.user && iotServicesCredentials.password, 'Enter iot services credentials before running this sample');

    this.host = iotServicesCredentials.host;
    this.tenant = iotServicesCredentials.tenant;
    this.user = iotServicesCredentials.user;
    this.password = iotServicesCredentials.password;
  }

  async ingestDataRest(deviceAlternateId, sensorAlternateId, capabilityAlternateId, measuresPayload, messageTimestamp) {
    const payload = {
      sensorAlternateId,
      capabilityAlternateId,
      measures: [measuresPayload]
    };

    if (messageTimestamp) {
      payload.timestamp = messageTimestamp;
    }

    const device = await this.getDeviceByAlternateId(deviceAlternateId);
    const certificate = await this._getCertificate(device.id);

    return await rp(
      {
        url: `https://${this.host}/iot/gateway/rest/measures/${deviceAlternateId}`,
        method: 'POST',
        body: payload,
        agentOptions: {
          key: certificate.key,
          cert: certificate.cert,
          passphrase: certificate.secret,
        }
      }
    );
  }

  async ingestDataMqtt(deviceAlternateId, sensorAlternateId, capabilityAlternateId, measuresPayload, messageTimestamp) {
    const payload = {
      sensorAlternateId,
      capabilityAlternateId,
      measures: [measuresPayload]
    };

    if (messageTimestamp) {
      payload.timestamp = messageTimestamp;
    }

    debug(`Sending message to IoTS: ${JSON.stringify(payload)}`);
    const mqttClient = await this._createMqttClient(deviceAlternateId);
    if (mqttClient._client.connected) {
      await mqttClient.publish(`measures/${deviceAlternateId}`, JSON.stringify(payload));
    } else {
      throw new Error('MQTT client not connected');
    }
  }

  async getGateway(gatewayId) {
    return await this._instanceRequest({ relativeUrl: `/gateways/${gatewayId}` });
  }

  async getDeviceByAlternateId(alternateId) {
    const result = await this._instanceRequest({ relativeUrl: `/devices?filter=alternateId eq '${alternateId}'` });
    return result[0];
  }

  async getSensorByAlternateId(alternateId) {
    const result = await this._instanceRequest({ relativeUrl: `/sensors?filter=alternateId eq '${alternateId}'` });
    return result[0];
  }

  async _getCertificate(deviceId) {
    const result = await this._instanceRequest({ relativeUrl: `/devices/${deviceId}/authentications/clientCertificate/pem` });
    const key = result.pem.substring(0, result.pem.indexOf('-----BEGIN CERTIFICATE-----'));
    const cert = result.pem.substring(key.length, result.pem.length);
    const secret = result.secret;
    return { key, cert, secret };
  }

  async _createMqttClient(deviceAlternateId) {
    const device = await this.getDeviceByAlternateId(deviceAlternateId);
    const certificate = await this._getCertificate(device.id);
    return new Promise(((resolve, reject) => {
      const url = `mqtts://${this.host}:8883`;

      const mqttClient = mqtt.connect(url, {
        key: certificate.key,
        cert: certificate.cert,
        rejectUnauthorized: true,
        passphrase: certificate.secret,
        clientId: deviceAlternateId
      });

      mqttClient.on('connect', async () => {
        debug('MQTT connection established');
        mqttClient.subscribe(`commands/${deviceAlternateId}`);
        mqttClient.subscribe(`measures/${deviceAlternateId}`);
        resolve(mqttClient);
      });

      mqttClient.on('error', (err) => {
        debug(`MQTT client creation failed: ${err}`);
        reject(err);
      });
    }));
  }

  async _instanceRequest({ relativeUrl, method = 'GET', headers = {} } = {}) {
    const url = `https://${this.host}/iot/core/api/v1/tenant/${this.tenant}${relativeUrl}`;
    headers.Authorization = `Basic ${Buffer.from(`${this.user}:${this.password}`).toString('base64')}`;
    return await rp({
      url, method, headers, json: true
    });
  }
}

module.exports = IoTServicesHelper;
