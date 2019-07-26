/**
 * This sample application shows how the SAP Leonardo IoT SDK can be used within an Node.js express application
 */

const express = require('express');
const LeonardoIoT = require('@sap/leonardo-iot-sdk');
const client = new LeonardoIoT();

const app = express();

app.get('/', async function (req, res) {
    res.send('SAP Leonardo IoT express sample application');
});

/**
 * Returning all packages of current tenant in a readable numbered list by requesting '/packages'.
 * Authorization is handled by the SDK itself in the following manner:
 * - Credentials for JWT token creation are fetched by Service Broker service binding
 * - In case no service broker service binding was found, credentials are fetched from .env file
 * - In case no .env file was found, credentials are fetched from environment variables
 * - In case no credentials could be determined the SDK will throw an error and the request will fail
 */
app.get('/packages', async function (req, res) {
    try {
        const packages = await client.getPackages();
        let response = '<h2>Package List</h2>' + packages.d.results.map((package, index) => `#${index + 1}<br/>Name: ${package.Name}`).join('<br/><br/>');
        res.send(response);
    } catch (err) {
        res.status(500).send('Something went wrong: ' + err);
    }
});

/**
 * Returning the first 10 things of current tenant ordered by ID in a readable numbered list by requesting '/things'.
 * Authorization will be forwarded from incoming request if available. If there was no authorization provided, it will be handled like in the /packages call above.
 */
app.get('/things', async function (req, res) {
    try {
        const things = await client.getThings(
            { '$select': '_id,_name', '$orderby': '_id', '$top': 10 },
            { jwt: req.headers.authorization }
        );
        let response = '<h2>Thing List</h2>' + things.value.map((thing, index) => `#${index + 1}<br/>ID: ${thing._id}<br/> Name: ${thing._name}`).join('<br/><br/>');
        res.send(response);
    } catch (err) {
        res.status(500).send('Something went wrong: ' + err);
    }
});

app.listen(8080, function () {
    console.log('App started successfully, listening on port 8080');
});
