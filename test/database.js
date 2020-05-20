
var expect = require('chai').expect;
var request = require('request');

describe('Simple URL management', function() {

  describe('test false API URL', function() {
    it('should return code 404', function(done) {
      var url = "http://localhost/api/false"

      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      });
    });
  });

  describe('test true API URL', function() {
    it('should return code 200', function(done) {
      var url = "http://localhost/api/classes"

      request(url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('test true API URL with bad parameters', function() {
    it('should return "Veuillez entrer le nom de l\'image"', function(done) {
      var url = "http://localhost/api/image_nom"

      request(url, function(error, response, body) {
        expect(response.body).to.equal('Veuillez entrer le nom de l\'image');
        done();
      });
    });
  });
});
