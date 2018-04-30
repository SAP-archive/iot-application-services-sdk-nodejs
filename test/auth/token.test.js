/* global describe it */
const assert = require('assert');
const Token = require('./../../lib/auth/Token');

describe('Token', () => {
  describe('getAccessToken', () => {
    it('should return the stored token', () => {
      const jwtToken = 'jwestesestdsf8u98324';
      const token = new Token(jwtToken, null);
      assert.equal(jwtToken, token.getAccessToken());
    });
  });

  describe('isExpired', () => {
    it('should not be expired', () => {
      const expiresIn = 1000;
      const token = new Token('1', expiresIn);
      assert.equal(false, token.isExpired());
    });

    it('should be expired', () => {
      const expiresIn = -1000;
      const token = new Token('1', expiresIn);
      assert.equal(true, token.isExpired());
    });
  });
});
