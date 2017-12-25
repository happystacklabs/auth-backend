import request from 'supertest';
import app from '../../../app.js';


describe('users', () => {
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





  describe('POST: /users', () => {
    it('should save the user to database if request is valid', () => {
      //TODO
    });

    it('should return a JSON user representation if request is valid', () => {
      //TODO
    });

    it('should return a jwt token', () => {
      //TODO
    });

    describe('username', () => {
      it('should return error if not unique', () => {
        //TODO
      });

      it('should return error if less than 3 characters', () => {
        //TODO
      });

      it('should return error if empty', () => {
        //TODO
      });

      it('should return error if not alphanumeric', () => {
        //TODO
      });
    });

    describe('email', () => {
      it('should return error if not unique', () => {
        //TODO
      });

      it('should return error if less than 3 characters', () => {
        //TODO
      });

      it('should return error if not an email format', () => {
        //TODO
      });

      it('should return error if empty', () => {
        //TODO
      });
    });

    describe('password', () => {
      it('should return error if less than 6 characters', () => {
        //TODO
      });

      it('should return error if empty', () => {
        //TODO
      });
    });
  });



  describe('POST: /users/login', () => {
    it('should return a JSON user representation if request is valid', () => {
      //TODO
    });

    it('should return a jwt token', () => {
      //TODO
    });

    describe('email', () => {
      it('should return error if empty', () => {
        //TODO
      });

      it('should return error if dont exist', () => {
        //TODO
      });
    });

    describe('password', () => {
      it('should return error if empty', () => {
        //TODO
      });

      it('should return error if password dont match', () => {
        //TODO
      });
    });
  });



  describe('GET: /user', () => {
    it('should return the current JSON representation of the current user', () => {
      //TODO
    });

    it('should return error if not loggued in', () => {
      //TODO
    });

    it('should retur 401 error if user is not found', () => {
      //TODO
    });
  });

});
