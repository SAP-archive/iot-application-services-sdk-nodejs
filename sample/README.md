# SAP Leonardo IoT SDK sample

## Remark
This coding is a sample showcase how to use SAP Leonardo IoT JavaScript SDK functionality, it is no official product of SAP SE. This code is free of public documentation and support and will not be maintained. Only SAP SE is allowed to share and publish this source code, receivers are allowed to align their coding to this sample. 

## Samples

- [1) Package operations like create, read and delete](./sample_1_packages.js)
- [2) Property Set Type operations like create, read and delete](./sample_2_property_set_types.js)
- [3) Thing onboarding including configuration setup](./sample_3_thing_setup.js)
- [4) Read and write thing data into time series store](./sample_4_thing_data.js)
- [5) Express server application reading things and packages](./sample_5_express_application.js)
- [6) Data ingestion for IoT Services device with MQTT or REST gateway](./sample_6_data_ingestion_iot_services)
- [7) Migrate models from one tenant to another](./sample_7_multi_tenant_model_migration.js)

## How to run a sample

#### Setup authorization
First please make sure that the authorization credentials are maintained in your local environment by using a `default-env.json` file within the sample folder. For more details about setting up a local definition for authorization please check the linked [***SDK's readme section***](../README.md#authorization-concept) Option 2.

#### Install dependencies
Next all dependencies including the SAP Leonardo IoT SDK itself has to be installed via NPM.
```
$ npm install
```

#### Choose, prepare and run sample
Some samples require manual user input (i.e. thing identifier) before they can be executed. 
Please choose a sample file you want to execute, open it and have a look to the upper description as well as all fields flagged with *//TODO* annotation.
No worry, in case you miss any input the script will tell you on execution.

Now you are ready to run your script by entering the following command
```
$ node <nameOfSampleFile>

# Example for sample 1
$ node sample_1_packages.js
```

