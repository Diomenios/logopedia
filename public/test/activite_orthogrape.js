
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      [1,2,3].indexOf(5).should.equal(-1);
      [1,2,3].indexOf(0).should.equal(-1);
    })
  })
})

describe('After this', function() {
  it('should be logged in', function(done) {
    expect($('#the-main-div')).to.exist;
    done();
  });
});
