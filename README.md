![](https://img.shields.io/badge/STATUS-NOT%20CURRENTLY%20MAINTAINED-red.svg?longCache=true&style=flat)

# Important Notice
We decided to deprecate and stop the development of this repository as it was replaced by the feature rich new [SAP Leonardo IoT SDK](https://github.com/SAP/leonardo-iot-sdk-nodejs). Please follow the [migration guide](https://github.com/SAP/leonardo-iot-sdk-nodejs/blob/master/MIGRATION-GUIDE.md) which provides step by step guidance adapting your existing project to the new SDK solution.

# SAP IoT Application Enablement SDK for Node.js

[![Build Status](https://travis-ci.org/SAP/iot-application-services-sdk-nodejs.svg?branch=master)](https://travis-ci.org/SAP/iot-application-services-sdk-nodejs)

**Table of Contents**
* [Description](#description)
* [Requirements](#requirements)
* [Download and Installation](#download-and-installation)
* [Known Issues](#known-issues)
* [How to obtain support](#how-to-obtain-support)
* [Contributing](#contributing)
* [To-Do (upcoming changes)](#to-do-upcoming-changes)
* [License](#license)

## Description
A Node.js package that acts as a thin wrapper over the [API of SAP IoT Application Enablement (SAP IoT AE)](https://uacp2.hana.ondemand.com/viewer/350cb3262cb8496b9f5e9e8b039b52db/1.32.0.0/en-US).

## Requirements
Expected SAP software:
* SAP IoT Application Enablement

Other requirements:
* [Node.js](https://nodejs.org/en/)

## Download and Installation
The following guide helps you to create a simple node-application which accesses data stored in SAP IoT AE.

__1. Generate a node.js application:__

Create a new folder called `node-wrapper-demo`. Start the command prompt in this folder, execute `npm init` and follow the instructions. When finished you should find a file called `package.json` in the folder.

__2. Install the NodeWrapper:__

Next, we add the NodeWrapper as a dependency to our node-application. For this purpose, add the following section to the `package.json`:

```js
{
  ...
  "dependencies": {
    "iot-application-services-sdk-nodejs": "SAP/iot-application-services-sdk-nodejs"
  },
  ...
}
```

Afterwards, go back to your command promit and execute `npm install`. This will install all dependencies specified in the `package.json`.

__3. Configuration:__

Next, we have to configure our NodeWrapper. Add a file called `.env` to the root of our project and add the following content:
```
AE_OAUTH_CLIENT_ID=<your client-id goes here>
AE_OAUTH_CLIENT_SECRET=<your client-secret goes here>
AE_TENANT=sap-iotaehandson
AE_LANDSCAPE=eu10
AE_HOST=hana.ondemand.com
```

__4. Usage:__

Now we create the main part of our application, which calls the API of SAP IoT AE. Create a file called `index.js` in the root of the project. Copy and paste the following code to this file:
```js
const AE = require('iot-application-services-sdk-nodejs');
const client = new AE();

async function main() {
  // set the base url
  client.setBaseUrl('appiot-mds'); // 'appiot-mds' = the app of the API we will use in the following

  // request the things
  let responseBody;
  try {
    responseBody = await client.request('/Things');
  } catch (err) {
    console.error(err.message);
  }

  console.log(responseBody); // will print all things on the console
}

main() // start the app
```

Now you can start the application. Enjoy!

> Hint: If you would like to see what is happening in the background, you can enable the logging to console via ``set DEBUG=ae_nodewrapper:*``.

## Known Issues
NA

## How to obtain support
Please create an issue within this GitHub repsitory.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

Lint and test your code using `npm test`.

We use [Semantic Versioning](http://semver.org/). For the versions available, see the [tags on this repository](https://github.com/SAP/iot-application-services-sdk-nodejs/tags). 

## To-Do (upcoming changes)
- [X] Refactoring
- [X] Send GET requests by just passing the url
- [ ] Support extrem parallelization
- [ ] TypeScript
- [ ] Streaming

## License
Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.

This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](LICENSE).
