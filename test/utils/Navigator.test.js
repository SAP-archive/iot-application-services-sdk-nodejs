const assert = require('assert');
const Navigator = require('../../lib/utils/Navigator');

describe('Navigator', () => {
  describe('Destinations', () => {
    let navigator;

    beforeEach(() => {
      navigator = new Navigator();
    });

    it('all functioned destinations are existing in sample env', async () => {
      assert(navigator.authorization());
      assert(navigator.businessPartner());
      assert(navigator.configPackage());
      assert(navigator.configThing());
      assert(navigator.appiotMds());
      assert(navigator.tmDataMapping());
      assert(navigator.appiotColdstore());
    });

    it('getDestination for known destination', async () => {
      assert.equal(navigator.getDestination('appiot-mds'), 'https://appiot-mds.cfapps.eu10.hana.ondemand.com', 'Unexpected destination');
    });

    it('getDestination for unknown destination', async () => {
      assert.throws(() => navigator.getDestination('unknown'), Error, 'Expected Error was not thrown');
    });
  });
});
