import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../app';
import User from '../../../models/User';


// jest.mock('../../models/User');
// import User from '../../models/User';

/*------------------------------------------------------------------------------
  users
-------------------------------------------------------------------------------*/
describe('users', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://127.0.0.1:27017/happystack-test', { useMongoClient: true }, () => {
      mongoose.connection.db.dropDatabase(() => { done(); });
    });
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.disconnect(done);
    });
  });

  /*----------------------------------------------------------------------------
  POST: /users
  ----------------------------------------------------------------------------*/
  describe('POST: /users', () => {
    describe('success', () => {
      const payload = {
        username: 'foobar',
        email: 'bar@bar.com',
        password: 'foobaz',
      };

      afterEach(() => {
        User.collection.drop();
      });

      it('should save the user to database if request is valid', (done) => {
        User.count({}, (err, count) => {
          expect(count).toBe(0);
          request(app)
            .post('/api/users')
            .send(payload)
            .expect(200)
            .end(() => {
              User.count({}, (err, count) => {
                expect(count).toBe(1);
                done();
              });
            });
        });
      });

      it('should return a JSON user representation if request is valid', (done) => {
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(200)
          .end((err, res) => {
            expect(res.body.username).toBe(payload.username);
            expect(res.body.email).toBe(payload.email);
            expect(res.body.token.length).toBeGreaterThan(1);
            done();
          });
      });
    });

    describe('username', () => {
      it('should return error if less than 5 characters', (done) => {
        const payload = {
          username: 'foo',
          email: 'foo@bar.com',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username.msg).toBe('Must be at least 5 characters');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          email: 'foo@bar.com',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username.msg).toBe('Can\'t be blank');
              done();
            });
          });
      });

      it('should return error if not alphanumeric', (done) => {
        const payload = {
          username: '########',
          email: 'foo@bar.com',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username.msg).toBe('Is invalid');
              done();
            });
          });
      });
    });

    describe('email', () => {
      it('should return error if not an email format', (done) => {
        const payload = {
          username: 'foobar',
          email: 'foobar',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.email.msg).toBe('Is invalid');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          username: 'foobar',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.email.msg).toBe('Can\'t be blank');
              done();
            });
          });
      });
    });

    describe('email and username', () => {
      it('should return error if not unique', (done) => {
        const payload = {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(200)
          .end(() => {
            User.count({}, (err, count) => {
              expect(count).toBe(1);
              request(app)
                .post('/api/users')
                .send(payload)
                .expect(422)
                .end((err, res) => {
                  User.count({}, (err, count) => {
                    expect(count).toBe(1);
                    const data = JSON.parse(res.text);
                    expect(data.errors.username.msg).toBe('Is already taken');
                    expect(data.errors.email.msg).toBe('Is already taken');
                    User.collection.drop();
                    done();
                  });
                });
            });
          });
      });
    });

    describe('password', () => {
      it('should return error if less than 5 characters', (done) => {
        const payload = {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foo',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.password.msg).toBe('Must be at least 5 characters');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          username: 'bob',
          email: 'bobette@hh.com',
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.password.msg).toBe('Can\'t be blank');
              done();
            });
          });
      });
    });
  });

  /*----------------------------------------------------------------------------
    POST: /users/login
  -----------------------------------------------------------------------------*/
  describe('POST: /users/login', () => {
    beforeEach((done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          done();
        });
    });

    afterEach(() => {
      User.collection.drop();
    });

    it('should return a JSON user representation if request is valid', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };
      request(app)
        .post('/api/users/login')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          expect(res.body.email).toBe(payload.email);
          expect(res.body.username).toBe(payload.username);
          expect(res.body.token.length).toBe(195);
          done();
        });
    });

    describe('email', () => {
      it('should return error if empty', (done) => {
        const payload = {
          password: 'foobar',
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors.email.msg).toBe('Can\'t be blank');
            done();
          });
      });

      it('should return error if dont exist', (done) => {
        const payload = {
          email: 'dont@exist.com',
          password: 'foobar',
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors['email or password'].msg).toBe('Is invalid');
            done();
          });
      });
    });

    describe('password', () => {
      it('should return error if empty', (done) => {
        const payload = {
          email: 'foo@bar.com',
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors.password.msg).toBe('Can\'t be blank');
            done();
          });
      });

      it('should return error if password dont match', (done) => {
        const payload = {
          email: 'foo@bar.com',
          password: 'fakepass',
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors['email or password'].msg).toBe('Is invalid');
            done();
          });
      });
    });
  });

  /*----------------------------------------------------------------------------
    GET: /user
  ----------------------------------------------------------------------------*/
  describe('GET: /user', () => {
    afterEach(() => {
      User.collection.drop();
    });

    it('should return the current JSON representation of the current user', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.token}`;
          request(app)
            .get('/api/user')
            .set('Authorization', token)
            .expect(200)
            .end((err, res) => {
              expect(res.body.username).toBe(payload.username);
              expect(res.body.email).toBe(payload.email);
              expect(res.body.token.length).toBe(195);
              done();
            });
        });
    });

    it('should return error if no token passed in header', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .expect(401)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.message).toBe('No authorization token was found');
              done();
            });
        });
    });

    it('should return error if token is wrong', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .set('Authorization', 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNDM4MWU0NzY5ZDIxMjRhZjQ3NmFiMiIsInVzZXJuYW1lIjoiZm9vYmFyIiwiZXhwaXJhdGlvbiI6MCwiaWF0IjoxNTE0MzczNjA0fQ.UzDmWdo_F5uUQpvkado6oj99bhHHc1LSGgunWFkjRzI')
            .expect(401)
            .end((err, res) => {
              expect(res.text).toBe('Unauthorized');
              done();
            });
        });
    });
  });

  /*----------------------------------------------------------------------------
    PUT: /user
  -----------------------------------------------------------------------------*/
  describe('PUT: /user', () => {
    const payload = {
      username: 'foobar',
      email: 'foo@bar.com',
      password: 'foobaz',
    };

    it('should modifiy the fields', (done) => {
      const update = {
        username: 'foobaz',
        email: 'baz@bar.com',
        password: 'barfoo',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              expect(res.body.username).toBe(update.username);
              expect(res.body.email).toBe(update.email);
              expect(res.body.token.length).toBe(195);
              done();
            });
        });
    });

    it('should return error if not loggued in', (done) => {
      request(app)
        .put('/api/user')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .expect(401)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.message).toBe('No authorization token was found');
              done();
            });
        });
    });

    it('should return errors if fields are not valid', (done) => {
      const update = {
        username: 'foo',
        email: 'baz',
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.email.msg).toBe('Is invalid');
              expect(data.errors.username.msg).toBe('Must be at least 5 characters');
              User.collection.drop();
              done();
            });
        });
    });

    it('should return error if password is less than 5 characters', (done) => {
      const update = { password: 'bar' };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.password.msg).toBe('Must be at least 5 characters');
              done();
            });
        });
    });
  });

  /*----------------------------------------------------------------------------
    POST: /users/forgot
  ----------------------------------------------------------------------------*/
  describe('POST: /users/forgot', () => {
    it('should send an error if email is empty', () => {
    });

    it('should send an error if email is not valid', () => {
    });

    it('should send an error if email doesnt exist', () => {
    });

    it('should set a token on user.passwordResetToken', () => {
    });

    it('should set a time of 1 hour from now on user.passwordResetExpires', () => {
    });

    it('should send a reset password email', () => {
    });
  });

  /*----------------------------------------------------------------------------
    POST: /users/reset
  ----------------------------------------------------------------------------*/
  describe('POST: /users/forgot', () => {

  });
});
