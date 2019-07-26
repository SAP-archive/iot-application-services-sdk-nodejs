const assert = require('assert');
const utils = require('../../lib/utils/utils');

describe('utils', () => {
  describe('isValidUrl', () => {
    it('should return true as a valid url is passed', () => {
      let url = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq CFB81003B9574F4EBDE98C31396ACE34';
      assert.equal(utils.isValidUrl(url), true);

      url = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq null';
      assert.equal(utils.isValidUrl(url), true);
    });

    it('should return false as a non valid url is passed', () => {
      const url = 'ysz';
      assert.equal(utils.isValidUrl(url), false);
    });
  });
});
