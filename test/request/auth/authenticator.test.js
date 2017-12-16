/* global describe it */
var assert = require('assert')
var nock = require('nock')
var Authenticator = require('../../../lib/request/auth/authenticator')

// some variable defintions for unit tests
var aExampleTokens = [{
  'access_token': '98723dsfsdf',
  'expires_in': -1000
}, {
  'access_token': '9dsffsesef',
  'expires_in': 100000
}]
var sClientId = 'clientId'
var sClientSecret = 'clientSecret'
var sAuthServer = 'https://auth-url.com'
var sAuthPath = '/token'

describe('authenticator', function () {
  describe('getAccessToken', function () {
    it('should return a token', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .reply(200, aExampleTokens[0])
      var promise = authenticator.getAccessToken()

      promise.then(
        function success (sToken) {
          assert.equal(sToken, aExampleTokens[0].access_token)
          done()
        },
        function error (err) {
          throw err
        }
      )
    })

    it('should only return a new token if the stored token is expired', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      // 1.) first call -> new token
      nock('https://auth-url.com')
        .post(sAuthPath)
        .reply(200, aExampleTokens[0])
      var oPromise1 = authenticator.getAccessToken()

      oPromise1.then(
        function success1 (sToken1) {
          assert.equal(sToken1, aExampleTokens[0].access_token) // check the first token

          // 2.) second call -> old token expired -> new token
          nock('https://auth-url.com')
            .post(sAuthPath)
            .reply(200, aExampleTokens[1])
          var oPromise2 = authenticator.getAccessToken()
          oPromise2.then(
            function success2 (sToken2) {
              assert.equal(sToken2, aExampleTokens[1].access_token) // check the second token

              // 3.) third call -> stored token again
              var oPromise3 = authenticator.getAccessToken()
              oPromise3.then(
                function success (sToken3) {
                  assert.equal(sToken3, aExampleTokens[1].access_token) // check the third token
                  done()
                }, error)
            }, error)
        }, error)

      function error (err) {
        throw err
      }
    })
  })

  describe('getNewToken', function () {
    it('should return a new token', function (done) {
      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .reply(function (uri, requestBody) {
          // check request headers
          assert.equal(this.req.headers['content-type'], 'application/x-www-form-urlencoded')
          assert.equal(this.req.headers['authorization'], 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0')
          // check request body
          assert.equal(requestBody, 'grant_type=client_credentials&response_type=token')
          return [200, aExampleTokens[0]]
        })

      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)
      var promise = authenticator.getNewToken()

      promise.then(
        function success (oToken) {
          assert.equal(oToken.getAccessToken(), aExampleTokens[0].access_token)
          done()
        },
        function error (err) {
          throw err
        }
      )
    })

    it('should return an error', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .replyWithError('something awful happened')
      var promise = authenticator.getNewToken()

      promise.then(
        function success (sToken) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.message, 'something awful happened')
          done()
        }
      )
    })

    it('Error: Response-code !== 200', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .reply(400, 'Error')
      var promise = authenticator.getNewToken()

      promise.then(
        function success (sToken) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.body, 'Error')
          done()
        }
      )
    })

    it('Error: Bad credentials', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .reply(401, 'Error')
      var promise = authenticator.getNewToken()

      promise.then(
        function success (sToken) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.message, 'Bad credentials')
          done()
        }
      )
    })

    it('Error: Token URL not found', function (done) {
      var authenticator = new Authenticator(sClientId, sClientSecret, sAuthServer + sAuthPath)

      nock('https://auth-url.com') // intercept the request to the authentification server
        .post(sAuthPath)
        .reply(404, 'Error')
      var promise = authenticator.getNewToken()

      promise.then(
        function success (sToken) {
          throw new Error('Promise should be rejected')
        },
        function error (err) {
          assert.equal(err.message, 'Token URL not found')
          done()
        }
      )
    })
  })
})
