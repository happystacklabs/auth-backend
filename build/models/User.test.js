'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_mongoose2.default.Promise = global.Promise;

describe('User', function () {
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

  describe('username', function () {
    var user = void 0;
    beforeEach(function () {
      user = new _User2.default();
    });

    afterEach(function () {
      user.remove();
    });

    it('should be stored as a String', function () {
      user.username = 12;
      expect(user.username).toBe('12');
    });

    it('should be stored in lowercase', function () {
      user.username = 'FOO';
      expect(user.username).toBe('foo');
    });

    it('should be required', function (done) {
      user.validate(function (err) {
        expect(err.errors.username.message).toBe('Can\'t be blank');
        done();
      });
    });

    it('should allow only alphanumeric', function (done) {
      user.username = '@#******';
      user.validate(function (err) {
        expect(err.errors.username.message).toBe('Is invalid');
        done();
      });
    });

    it('should be more than 5 characters', function (done) {
      user.username = 'foo';
      user.validate(function (err) {
        expect(err.errors.username.message).toBe('Must be at least 5 characters');
        done();
      });
    });
  });

  describe('email', function () {
    var user = void 0;
    beforeEach(function () {
      user = new _User2.default();
    });

    afterEach(function () {
      user.remove();
    });

    it('should be stored in lowercase', function () {
      user.email = 'FOO@BAR.COM';
      expect(user.email).toBe('foo@bar.com');
    });

    it('should be required', function (done) {
      user.validate(function (err) {
        expect(err.errors.email.message).toBe('Can\'t be blank');
        done();
      });
    });

    it('should allow only email format', function (done) {
      user.email = '@#*';
      user.validate(function (err) {
        expect(err.errors.email.message).toBe('Is invalid');
        done();
      });
    });
  });

  describe('username and email', function () {
    it('should be unique', function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(done) {
        var firstUser, secondUser;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new _User2.default({ username: 'foobar', email: 'bar@bar.com' });

              case 2:
                firstUser = _context.sent;
                _context.next = 5;
                return firstUser.save();

              case 5:
                _context.next = 7;
                return (0, _User2.default)({ username: 'foobar', email: 'bar@bar.com' });

              case 7:
                secondUser = _context.sent;

                secondUser.validate(function (err) {
                  expect(err.errors.username.message).toBe('Is already taken');
                  expect(err.errors.email.message).toBe('Is already taken');
                  firstUser.remove();
                  done();
                });

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  });

  describe('setPassword', function () {
    var user = void 0;
    beforeEach(function () {
      user = new _User2.default();
    });

    afterEach(function () {
      user.remove();
    });

    it('set a salt to the user', function () {
      expect(user.salt).toBe(undefined);
      user.setPassword('foobar');
      expect(user.salt.length).toBe(32);
    });

    it('set an hash to the user', function () {
      expect(user.hash).toBe(undefined);
      user.setPassword('foobar');
      expect(user.hash.length).toBe(1024);
    });
  });

  describe('validPassword', function () {
    var user = void 0;
    beforeEach(function () {
      user = new _User2.default();
      user.setPassword('foobar');
    });

    afterEach(function () {
      user.remove();
    });

    it('return false if the two passwords are not same', function () {
      expect(user.validPassword('foobaz')).toBe(false);
    });

    it('return true if the two passwords are the same', function () {
      expect(user.validPassword('foobar')).toBe(true);
    });
  });

  describe('generateJWT', function () {
    it('return a JWT token', function () {
      var user = new _User2.default({ username: 'foo', email: 'foo@bar.com' });
      user.setPassword('foobar');
      expect(user.generateJWT().length).toBe(191);
    });
  });

  describe('toAuthJSON', function () {
    it('return a JSON of a user for authentification', function () {
      var user = new _User2.default({ username: 'foo', email: 'foo@bar.com' });
      user.setPassword('foobar');
      var token = user.generateJWT();
      expect(user.toAuthJSON()).toEqual({
        username: 'foo',
        email: 'foo@bar.com',
        token: token
      });
    });
  });
});