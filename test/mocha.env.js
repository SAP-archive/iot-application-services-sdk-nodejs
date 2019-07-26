console.log('Setting mocha test environment variables');
console.log('SET VCAP_SERVICES');
process.env.VCAP_SERVICES = JSON.stringify({
    iotae: [{
        name: 'iot_internal',
        plan: 'standard',
        tags: ['leonardoiot'],
        credentials: {
            endpoints: {
                'tm-data-mapping': 'https://tm-data-mapping.cfapps.eu10.hana.ondemand.com',
                authorization: 'https://authorization.cfapps.eu10.hana.ondemand.com',
                'appiot-mds': 'https://appiot-mds.cfapps.eu10.hana.ondemand.com',
                'appiot-coldstore': 'https://appiot-coldstore.cfapps.eu10.hana.ondemand.com',
                'config-thing-sap': 'https://config-thing-sap.cfapps.eu10.hana.ondemand.com',
                'config-package-sap': 'https://config-package-sap.cfapps.eu10.hana.ondemand.com',
                'analytics-thing-sap': 'https://analytics-thing-sap.cfapps.eu10.hana.ondemand.com',
                'rules-designtime': 'https://sap-iot-noah-live-rules-designtime.cfapps.eu10.hana.ondemand.com',
                'business-partner': 'https://business-partner.cfapps.eu10.hana.ondemand.com'
            },
            uaa: {
                uaadomain: 'authentication.eu10.hana.ondemand.com',
                tenantmode: 'dedicated',
                sburl: 'https://internal-xsuaa.authentication.eu10.hana.ondemand.com',
                clientid: 'MyClientId',
                apiurl: 'https://api.authentication.eu10.hana.ondemand.com',
                xsappname: 'saptest!b16977|iotae_service!b5',
                identityzone: 'saptest',
                identityzoneid: '92da712a-4ce5-40d9-9d8f-b6a6d47a58aa',
                clientsecret: 'MyClientSecret',
                tenantid: '92da712a-4ce5-40d9-9d8f-b6a6d47a58aa',
                url: 'https://saptest.authentication.eu10.hana.ondemand.com'
            }
        }
    }],
    "user-provided": [
        {
            "name": "leonardo-iot-account-test",
            "credentials": {
                "endpoints": {
                    "appiot-mds": "https://appiot-mds-backup.cfapps.de01.hana.ondemand.com"
                },
                "uaa": {
                    "url": "https://testAccountUrl",
                    "clientid": "testAccountId",
                    "clientsecret": "testAccountSecret"
                }
            }
        },
        {
            "name": "leonardo-iot-account-dev",
            "credentials": {
                "endpoints": {
                    "appiot-mds": "https://appiot-mds-backup.cfapps.de01.hana.ondemand.com"
                },
                "uaa": {
                    "url": "https://devAccountUrl",
                    "clientid": "devAccountId",
                    "clientsecret": "devAccountSecret"
                }
            }
        }
    ]
});
