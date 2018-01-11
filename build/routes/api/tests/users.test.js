'use strict';

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _app = require('../../../app');

var _User = require('../../../models/User');

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// jest.mock('../../models/User');
// import User from '../../models/User';


describe('users', function () {
  beforeAll(function (done) {
    _mongoose2.default.connect('mongodb://127.0.0.1:27017/happystack-test', { useMongoClient: true }, function () {
      _mongoose2.default.connection.db.dropDatabase(function () {
        done();
      });
    });
  });

  afterAll(function (done) {
    _mongoose2.default.connection.db.dropDatabase(function () {
      _mongoose2.default.disconnect(done);
    });
  });

  describe('POST: /users', function () {
    describe('success', function () {
      var payload = {
        user: {
          username: 'foobar',
          email: 'bar@bar.com',
          password: 'foobaz'
        }
      };

      afterEach(function () {
        _User2.default.collection.drop();
      });

      it('should save the user to database if request is valid', function (done) {
        _User2.default.count({}, function (err, count) {
          expect(count).toBe(0);
          (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function () {
            _User2.default.count({}, function (err, count) {
              expect(count).toBe(1);
              done();
            });
          });
        });
      });

      it('should return a JSON user representation if request is valid', function (done) {
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function (err, res) {
          expect(res.body.user.username).toBe(payload.user.username);
          expect(res.body.user.email).toBe(payload.user.email);
          expect(res.body.user.token.length).toBeGreaterThan(1);
          done();
        });
      });
    });

    describe('username', function () {
      it('should return error if less than 5 characters', function (done) {
        var payload = {
          user: {
            username: 'foo',
            email: 'foo@bar.com',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.username).toBe('Must be at least 5 characters');
            done();
          });
        });
      });

      it('should return error if empty', function (done) {
        var payload = {
          user: {
            email: 'foo@bar.com',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.username).toBe('Can\'t be blank');
            done();
          });
        });
      });

      it('should return error if not alphanumeric', function (done) {
        var payload = {
          user: {
            username: '########',
            email: 'foo@bar.com',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.username).toBe('Is invalid');
            done();
          });
        });
      });
    });

    describe('email', function () {
      it('should return error if not an email format', function (done) {
        var payload = {
          user: {
            username: 'foobar',
            email: 'foobar',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.email).toBe('Is invalid');
            done();
          });
        });
      });

      it('should return error if empty', function (done) {
        var payload = {
          user: {
            username: 'foobar',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.email).toBe('Can\'t be blank');
            done();
          });
        });
      });
    });

    describe('email and username', function () {
      it('should return error if not unique', function (done) {
        var payload = {
          user: {
            username: 'foobar',
            email: 'foo@bar.com',
            password: 'foobaz'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function () {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(1);
            (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
              _User2.default.count({}, function (err, count) {
                expect(count).toBe(1);
                var data = JSON.parse(res.text);
                expect(data.errors.username).toBe('Is already taken');
                expect(data.errors.email).toBe('Is already taken');
                _User2.default.collection.drop();
                done();
              });
            });
          });
        });
      });
    });

    describe('password', function () {
      it('should return error if less than 5 characters', function (done) {
        var payload = {
          user: {
            username: 'foobar',
            email: 'foo@bar.com',
            password: 'foo'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.password).toBe('Must be at least 5 characters');
            done();
          });
        });
      });

      it('should return error if empty', function (done) {
        var payload = {
          user: {
            username: 'bob',
            email: 'bobette@hh.com'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(422).end(function (err, res) {
          _User2.default.count({}, function (err, count) {
            expect(count).toBe(0);
            var data = JSON.parse(res.text);
            expect(data.errors.password).toBe('Can\'t be blank');
            done();
          });
        });
      });
    });
  });

  describe('POST: /users/login', function () {
    beforeEach(function (done) {
      var payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function () {
        done();
      });
    });

    afterEach(function () {
      _User2.default.collection.drop();
    });

    it('should return a JSON user representation if request is valid', function (done) {
      var payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users/login').send(payload).expect(200).end(function (err, res) {
        expect(res.body.user.email).toBe(payload.user.email);
        expect(res.body.user.username).toBe(payload.user.username);
        expect(res.body.user.token.length).toBe(195);
        done();
      });
    });

    describe('email', function () {
      it('should return error if empty', function (done) {
        var payload = {
          user: {
            password: 'foobar'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users/login').send(payload).expect(422).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.email).toBe('Can\'t be blank');
          done();
        });
      });

      it('should return error if dont exist', function (done) {
        var payload = {
          user: {
            email: 'dont@exist.com',
            password: 'foobar'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users/login').send(payload).expect(422).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors['email or password']).toBe('Is invalid');
          done();
        });
      });
    });

    describe('password', function () {
      it('should return error if empty', function (done) {
        var payload = {
          user: {
            email: 'foo@bar.com'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users/login').send(payload).expect(422).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.password).toBe('Can\'t be blank');
          done();
        });
      });

      it('should return error if password dont match', function (done) {
        var payload = {
          user: {
            email: 'foo@bar.com',
            password: 'fakepass'
          }
        };
        (0, _supertest2.default)(_app.app).post('/api/users/login').send(payload).expect(422).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors['email or password']).toBe('Is invalid');
          done();
        });
      });
    });
  });

  describe('GET: /user', function () {
    afterEach(function () {
      _User2.default.collection.drop();
    });

    it('should return the current JSON representation of the current user', function (done) {
      var payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function (err, res) {
        var token = 'Token ' + res.body.user.token;
        (0, _supertest2.default)(_app.app).get('/api/user').set('Authorization', token).expect(200).end(function (err, res) {
          expect(res.body.user.username).toBe(payload.user.username);
          expect(res.body.user.email).toBe(payload.user.email);
          expect(res.body.user.token.length).toBe(195);
          done();
        });
      });
    });

    it('should return error if no token passed in header', function (done) {
      var payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function () {
        (0, _supertest2.default)(_app.app).get('/api/user').expect(401).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.message).toBe('No authorization token was found');
          done();
        });
      });
    });

    it('should return error if token is wrong', function (done) {
      var payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function () {
        (0, _supertest2.default)(_app.app).get('/api/user').set('Authorization', 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNDM4MWU0NzY5ZDIxMjRhZjQ3NmFiMiIsInVzZXJuYW1lIjoiZm9vYmFyIiwiZXhwaXJhdGlvbiI6MCwiaWF0IjoxNTE0MzczNjA0fQ.UzDmWdo_F5uUQpvkado6oj99bhHHc1LSGgunWFkjRzI').expect(401).end(function (err, res) {
          expect(res.text).toBe('Unauthorized');
          done();
        });
      });
    });
  });

  describe('PUT: /user', function () {
    var payload = {
      user: {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz'
      }
    };

    it('should modifiy the fields', function (done) {
      var update = {
        user: {
          username: 'foobaz',
          email: 'baz@bar.com',
          password: 'barfoo'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function (err, res) {
        var token = 'Token ' + res.body.user.token;
        (0, _supertest2.default)(_app.app).put('/api/user').set('Authorization', token).send(update).expect(200).end(function (err, res) {
          expect(res.body.user.username).toBe(update.user.username);
          expect(res.body.user.email).toBe(update.user.email);
          expect(res.body.user.token.length).toBe(195);
          done();
        });
      });
    });

    it('should return error if not loggued in', function (done) {
      (0, _supertest2.default)(_app.app).put('/api/user').send(payload).expect(200).end(function () {
        (0, _supertest2.default)(_app.app).get('/api/user').expect(401).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.message).toBe('No authorization token was found');
          done();
        });
      });
    });

    it('should return errors if fields are not valid', function (done) {
      var update = {
        user: {
          username: 'foo',
          email: 'baz'
        }
      };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function (err, res) {
        var token = 'Token ' + res.body.user.token;
        (0, _supertest2.default)(_app.app).put('/api/user').set('Authorization', token).send(update).expect(200).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.email).toBe('Is invalid');
          expect(data.errors.username).toBe('Must be at least 5 characters');
          _User2.default.collection.drop();
          done();
        });
      });
    });

    it('should return error if password is less than 5 characters', function (done) {
      var update = { user: { password: 'bar' } };
      (0, _supertest2.default)(_app.app).post('/api/users').send(payload).expect(200).end(function (err, res) {
        var token = 'Token ' + res.body.user.token;
        (0, _supertest2.default)(_app.app).put('/api/user').set('Authorization', token).send(update).expect(200).end(function (err, res) {
          var data = JSON.parse(res.text);
          expect(data.errors.password).toBe('Must be at least 5 characters');
          done();
        });
      });
    });
  });
});