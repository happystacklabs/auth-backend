import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../app';
import User from '../../../models/User';


jest.mock('mailgun-js');
// eslint-disable-next-line
import mailgun from 'mailgun-js';


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

      afterEach((done) => {
        User.remove({}, () => { done(); });
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

    afterEach((done) => {
      User.remove({}, () => { done(); });
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
    beforeEach((done) => {
      User.remove({}, () => { done(); });
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
    beforeEach((done) => {
      User.remove({}, () => { done(); });
    });

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
    beforeEach((done) => {
      User.remove({}, () => { done(); });
    });

    it('should send an error if email is empty', (done) => {
      const payload = {};
      request(app)
        .post('/api/users/forgot')
        .send(payload)
        .expect(422)
        .end((err, res) => {
          const data = JSON.parse(res.text);
          expect(data.errors.email.msg).toBe('Can\'t be blank');
          done();
        });
    });

    it('should send an error if email is not valid', (done) => {
      const payload = { email: 'foo@..' };
      request(app)
        .post('/api/users/forgot')
        .send(payload)
        .expect(422)
        .end((err, res) => {
          const data = JSON.parse(res.text);
          expect(data.errors.email.msg).toBe('Is invalid');
          done();
        });
    });

    it('should send an error if email doesnt exist', (done) => {
      const payload = { email: 'foo@bar.com' };
      request(app)
        .post('/api/users/forgot')
        .send(payload)
        .expect(422)
        .end((err, res) => {
          const data = JSON.parse(res.text);
          expect(data.errors.email.msg).toBe('The email address is not associated with any account.');
          done();
        });
    });

    it('should set a token on user.passwordResetToken', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };

      const send = jest.fn((args, callback) => callback());
      const mg = {
        messages: () => ({
          send,
        }),
      };
      mailgun.mockImplementation(() => mg);
      expect(send.mock.calls.length).toBe(0);

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                expect(user.passwordResetToken.length).toBe(32);
                expect(send.mock.calls.length).toBe(1);
                done();
              });
            });
        });
    });

    it('should set a time of 1 hour from now on user.passwordResetExpires', (done) => {
      const payload = {
        username: 'foobar',
        email: 'test@happystack.io',
        password: 'foobaz',
      };

      const send = jest.fn((args, callback) => callback());
      const mg = {
        messages: () => ({
          send,
        }),
      };
      mailgun.mockImplementation(() => mg);
      expect(send.mock.calls.length).toBe(0);

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                const date = new Date(Date.now() + 3600000);
                expect(user.passwordResetExpires.getHours()).toBe(date.getHours());
                expect(send.mock.calls.length).toBe(1);
                done();
              });
            });
        });
    });

    it('should send a reset password email', (done) => {
      const payload = {
        username: 'foobar',
        email: 'test@happystack.io',
        password: 'foobaz',
      };

      const send = jest.fn((args, callback) => callback());
      const mg = {
        messages: () => ({
          send,
        }),
      };
      mailgun.mockImplementation(() => mg);
      expect(send.mock.calls.length).toBe(0);

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              expect(send.mock.calls.length).toBe(1);
              expect(send.mock.calls[0][0].to).toBe(payload.email);
              done();
            });
        });
    });
  });

  /*----------------------------------------------------------------------------
    POST: /users/reset
  ----------------------------------------------------------------------------*/
  describe('POST: /users/reset', () => {
    beforeEach((done) => {
      User.remove({}, () => { done(); });
    });

    it('should send an error if password is less than 5 characters', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };

      const passwordPayload = { password: 'bar', passwordConfirm: 'bar' };

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/reset')
            .send(passwordPayload)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.password.msg).toBe('Must be at least 5 characters');
              expect(data.errors.passwordConfirm.msg).toBe('Must be at least 5 characters');
              done();
            });
        });
    });

    it('should send an error if passwords dont match', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };

      const passwordPayload = { password: 'foobar', passwordConfirm: 'bazfoo' };

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/reset')
            .send(passwordPayload)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.passwordConfirm.msg).toBe('Passwords must match');
              done();
            });
        });
    });

    it('should send an error if reset token is invalid', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };

      const passwordPayload = { password: 'foobar', passwordConfirm: 'foobar', token: 'foo' };

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/reset')
            .send(passwordPayload)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.token.msg).toBe('Password reset token is invalid or has expired');
              done();
            });
        });
    });

    it('should send an error if reset token is expired', (done) => {
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
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                const userCopy = user;
                userCopy.passwordResetExpires = Date.now() - 8000000000;
                userCopy.save(() => {
                  const passwordPayload = {
                    password: 'foobar',
                    passwordConfirm: 'foobar',
                    token: userCopy.passwordResetToken,
                  };
                  request(app)
                    .post('/api/users/reset')
                    .send(passwordPayload)
                    .expect(200)
                    .end((err, res) => {
                      const data = JSON.parse(res.text);
                      expect(data.errors.token.msg).toBe('Password reset token is invalid or has expired');
                      done();
                    });
                });
              });
            });
        });
    });

    it('should change the user password to the new password', (done) => {
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
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                const passwordPayload = {
                  password: 'foobar',
                  passwordConfirm: 'foobar',
                  token: user.passwordResetToken,
                };
                const { hash } = user;
                request(app)
                  .post('/api/users/reset')
                  .send(passwordPayload)
                  .expect(200)
                  .end(() => {
                    User.findOne({ email: payload.email }, (err, userNew) => {
                      expect(userNew.hash).not.toBe(hash);
                      done();
                    });
                  });
              });
            });
        });
    });

    it('should reset the token and token expiration to undefined', (done) => {
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
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                const passwordPayload = {
                  password: 'foobar',
                  passwordConfirm: 'foobar',
                  token: user.passwordResetToken,
                };
                request(app)
                  .post('/api/users/reset')
                  .send(passwordPayload)
                  .expect(200)
                  .end(() => {
                    User.findOne({ email: payload.email }, (err, userNew) => {
                      expect(userNew.passwordResetToken).toBe(undefined);
                      expect(userNew.passwordResetExpires).toBe(undefined);
                      done();
                    });
                  });
              });
            });
        });
    });

    it('should send a confirmation email', (done) => {
      const payload = {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      };

      const send = jest.fn((args, callback) => callback());
      const mg = {
        messages: () => ({
          send,
        }),
      };
      mailgun.mockImplementation(() => mg);
      expect(send.mock.calls.length).toBe(0);

      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .post('/api/users/forgot')
            .send({ email: payload.email })
            .expect(200)
            .end(() => {
              User.findOne({ email: payload.email }, (error, user) => {
                const passwordPayload = {
                  password: 'foobar',
                  passwordConfirm: 'foobar',
                  token: user.passwordResetToken,
                };
                request(app)
                  .post('/api/users/reset')
                  .send(passwordPayload)
                  .expect(200)
                  .end(() => {
                    expect(send.mock.calls.length).toBe(2);
                    expect(send.mock.calls[1][0].to).toBe(payload.email);
                    done();
                  });
              });
            });
        });
    });
  });
});
