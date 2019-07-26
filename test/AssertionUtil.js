const assert = require('assert');
const querystring = require('querystring');

class AssertionUtil {
  static assertRequestConfig(requestConfig, expected) {
    if (!expected.headers) expected.headers = {};

    assert.equal(querystring.unescape(requestConfig.url), expected.url, 'Unexpected Request URL');
    expected.method ? assert.equal(requestConfig.method, expected.method, 'Unexpected method') : assert(!requestConfig.method, 'Unexpected method');
    expected.headers ? assert.deepEqual(requestConfig.headers, expected.headers, 'Unexpected headers') : assert(!requestConfig.headers, 'Unexpected headers');
    expected.body ? assert.deepEqual(requestConfig.body, expected.body, 'Unexpected body') : assert(!requestConfig.body, 'Unexpected body');
    expected.resolveWithFullResponse !== undefined ? assert.equal(requestConfig.resolveWithFullResponse, expected.resolveWithFullResponse, 'Unexpected response resolve option') : assert(!requestConfig.resolveWithFullResponse, 'Unexpected response resolve option');
    expected.jwt ? assert.equal(requestConfig.jwt, expected.jwt, 'Unexpected jwt token') : assert(!requestConfig.jwt, 'Unexpected jwt token');
    expected.agentOptions ? assert.deepEqual(requestConfig.agentOptions, expected.agentOptions, 'Unexpected agent options') : assert(!requestConfig.agentOptions, 'Unexpected agent options');

    if (expected.json !== undefined) { assert.equal(requestConfig.json, expected.json, 'Unexpected JSON parameter'); }
  }
}

module.exports = AssertionUtil;
