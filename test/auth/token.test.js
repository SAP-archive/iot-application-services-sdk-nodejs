const assert = require('assert');
const Token = require('../../lib/auth/token');

describe('Token', () => {
  describe('getAccessToken', () => {
    it('should return the stored token', () => {
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
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
