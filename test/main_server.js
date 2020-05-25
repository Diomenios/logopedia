
var expect = require('chai').expect;
var request = require('request');

describe('Simple URL management', function() {

  describe('test of incorrect URL', function() {
    it('should return code 404', function(done) {
      var url = "http://localhost/testing"

      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    });
  });

  describe('test of correct URL', function() {
    it('should return code 200', function(done) {
      var url = "http://localhost/"

      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });
});
