var assert = require('assert');
var helper = require('../helper');

describe('UserModel', function() {

  before(function(done) {
    helper.liftSails(done);
  });

  after(function(done) {
    helper.lowerSails(done);
  });

  describe('#create()', function() {
    it('should fail if email was not specified', function(done) {
      User.create({password: 'password'})
        .exec(function(err, user) {
          assert.equal(user, null);
          done();
        });
    });

    it('should fail if password was not specified', function(done) {
      User.create({email: 'email'})
        .exec(function(err, user) {
          assert.equal(user, null);
          done();
        });
    });

    it('should save successfully if email and password were specified', function(done) {
      User.create({email: 'fake.email@google.com', password: 'password'})
        .exec(function(err, user) {
          assert.equal(err, null);
          assert.ok(user);
          done();
        });
    });

    it('should encrypt given password', function(done) {
      var unencryptedPassword = 'password';
      User.create({email: 'fake.email@google.com', password: unencryptedPassword})
        .exec(function(err, user) {
          assert.notEqual(user.password, unencryptedPassword);
          done();
        });
    });

  });

  describe('#login()', function() {
    var email = 'some.email@google.com';
    var password = 'password';

    beforeEach(function(done) {
      helper.destroyAll(User, function() {
        User.create({email: email, password: password})
          .then(function(user) { done() })
          .fail(function(err) { throw err });
      });
    });

    it('should succeed if correct email and password given', function(done) {
      User.login(email, password, function(err, user) {
        assert.equal(err, null);
        assert.ok(user);
        done();
      });
    });

    it('should fail if incorrect email given', function(done) {
      User.login('wrong.email@google.com', password, function(err, user) {
        assert.ok(err);
        assert.equal(user, null);
        done();
      });
    });

    it('should fail if incorrect password given', function(done) {
      User.login(email, 'bad.password', function(err, user) {
        assert.ok(err);
        assert.equal(user, null);
        done();
      });
    });
  });
});