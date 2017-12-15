# SAP IoT Application Enablement SDK for JavaScript in Node.js
> A nodeJS package that acts as a thin wrapper over the [API of SAP IoT Application Enablement (SAP IoT AE)](https://uacp2.hana.ondemand.com/viewer/350cb3262cb8496b9f5e9e8b039b52db/1.32.0.0/en-US).

**Table of Contents**
* [Getting Started](#getting-started)
* [Contributing](#contributing)
* [Versioning](#versioning)
* [License](#license)

## Getting Started
The following guide helps you to create a simple node-application which accesses data stored in SAP IoT AE.

__Prerequisites:__
* Connection to Corporate-Github with [SSH](https://help.github.com/articles/connecting-to-github-with-ssh/)
* [Node.js](https://nodejs.org/en/)

__1. Generate a node.js application:__

Create a new folder called `node-wrapper-demo`. Start the command prompt in this folder, execute `npm init` and follow the instructions. When finished you should find a file called `package.json` in the folder.

__2. Install the NodeWrapper:__

Next, we add the NodeWrapper as a dependency to our node-application. For this purpose, add the following section to the `package.json`:

```js
{
  ...
  "dependencies": {
    "iot-application-services-sdk-nodejs": "git+ssh://git@github.com:SAP/iot-application-services-sdk-nodejs.git"
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
var NodeAE = require('iot-application-services-sdk-nodejs')
var nodeAE = new NodeAE()

// set the base URI for the NodeWrapper
nodeAE.setBaseURI('appiot-mds') // 'appiot-mds' = the app of the API we will use in the following

// now we can use plain http methods to send requests (post, get, put, delete)
var loadingThings = nodeAE.get('/Things')
loadingThings.then(
  function success (oResponse) {
    console.log(JSON.parse(oResponse.body)) // will print all Things on the console
  },
  function error (err) {
    throw err
  }
)
```

Now you can start the application. Enjoy!

> Hint: If you would like to see what is happening in the background, you can enable the logging to console via ``set DEBUG=ae_nodewrapper:*``.

__5. Moving forward:__

_For more complex examples and usage, please refer to the [Wiki](https://github.com/SAP/iot-application-services-sdk-nodejs/wiki)._

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

Lint and test your code using `npm test`.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/SAP/iot-application-services-sdk-nodejs/tags). 

## License

Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the [LICENSE file](LICENSE).