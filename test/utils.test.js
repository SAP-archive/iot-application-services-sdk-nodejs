/* global describe it */
const assert = require('assert');
const Utils = require('../lib/utils/utils');

describe('utils', () => {
  describe('isValidUrl', () => {
    it('should return true as a valid url is passed', () => {
      let url = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq CFB81003B9574F4EBDE98C31396ACE34';
      assert.equal(Utils.isValidUrl(url), true);

      url = 'https://authorization.cfapps.eu10.hana.ondemand.com/ObjectGroups?$filter=objectGroupParentID eq null';
      assert.equal(Utils.isValidUrl(url), true);
    });

    it('should return false as a non valid url is passed', () => {
      const url = 'ysz';
      assert.equal(Utils.isValidUrl(url), false);
    });
  });
});
