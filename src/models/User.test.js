import mongoose from 'mongoose';
import User from './User';


mongoose.Promise = global.Promise;

describe('User', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://127.0.0.1:27017/happystack-test', {useMongoClient: true}, () => {
      mongoose.connection.db.dropDatabase(() => {done()});
    });
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.disconnect(done);
    });
  });

  describe('username', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });

    afterEach(() => {
      user.remove();
    });

    it('should be stored as a String', () => {
      user.username = 12;
      expect(user.username).toBe('12');
    });

    it('should be stored in lowercase', () => {
      user.username = 'FOO';
      expect(user.username).toBe('foo');
    });

    it('should be required', (done) => {
      user.validate(function(err) {
        expect(err.errors.username.message).toBe('Can\'t be blank');
        done();
      });
    });

    it('should allow only alphanumeric', (done) => {
      user.username = '@#*';
      user.validate(function(err) {
        expect(err.errors.username.message).toBe('Is invalid');
        done();
      });
    });
  });

  describe('email', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });

    afterEach(() => {
      user.remove();
    });

    it('should be stored in lowercase', () => {
      user.email = 'FOO@BAR.COM';
      expect(user.email).toBe('foo@bar.com');
    });

    it('should be required', (done) => {
      user.validate(function(err) {
        expect(err.errors.email.message).toBe('Can\'t be blank');
        done();
      });
    });

    it('should allow only email format', (done) => {
      user.email = '@#*';
      user.validate(function(err) {
        expect(err.errors.email.message).toBe('Is invalid');
        done();
      });
    });
  });

  describe('username and email', () => {
    it('should be unique', async (done) => {
      const firstUser = await new User({username: 'foo', email: 'bar@bar.com'});
      await firstUser.save();

      const secondUser = await User({username: 'foo', email: 'bar@bar.com'});
      secondUser.validate(function(err) {
        expect(err.errors.username.message).toBe('Is already taken');
        expect(err.errors.email.message).toBe('Is already taken');
        firstUser.remove();
        done();
      });
    });
  });

  describe('setPassword', () => {
    let user;
    beforeEach(() => {
      user = new User();
    });

    afterEach(() => {
      user.remove();
    });

    it('set a salt to the user', () => {
      expect(user.salt).toBe(undefined);
      user.setPassword('foo');
      expect(user.salt.length).toBe(32);
    });

    it('set an hash to the user', () => {
      expect(user.hash).toBe(undefined);
      user.setPassword('foo');
      expect(user.hash.length).toBe(1024);
    });
  });

  describe('validPassword', () => {
    let user;
    beforeEach(() => {
      user = new User();
      user.setPassword('foobar');
    });

    afterEach(() => {
      user.remove();
    });

    it('return false if the two passwords are not same', () => {
      expect(user.validPassword('foobaz')).toBe(false);
    });

    it('return true if the two passwords are the same', () => {
      expect(user.validPassword('foobar')).toBe(true);
    });
  });

  describe('generateJWT', () => {
    it('return a JWT token', () => {
      const user = new User({username: 'foo', email: 'foo@bar.com'});
      user.setPassword('foobar');
      expect(user.generateJWT().length).toBe(191);
    });
  });

  describe('toAuthJSON', () => {
    it('return a JSON of a user for authentification', () => {
      const user = new User({username: 'foo', email: 'foo@bar.com'});
      user.setPassword('foobar');
      const token = user.generateJWT();
      expect(user.toAuthJSON()).toEqual({
        username: 'foo',
        email: 'foo@bar.com',
        token: token
      });
    });
  });
});
