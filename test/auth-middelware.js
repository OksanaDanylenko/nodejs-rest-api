const jwt = require('jsonwebtoken');
const expect = require('chai').expect;
const sinon = require('sinon');

const authMiddelware = require('../middelware/is-auth');

describe('Auth middleware', function () {
  it('should throw an error if no authorization header is present', function () {
    const req = {
      get: function () {
        return null;
      },
    };

    //bind - prepared by call, not just call
    expect(authMiddelware.bind(this, req, {}, () => {})).to.throw(
      'Not authenticated',
    );
  });

  it('should throw an error if the authorization header is only one string', function () {
    const req = {
      get: function () {
        return 'xyz';
      },
    };

    expect(authMiddelware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if the token cannot be verified', function () {
    const req = {
      get: function () {
        return 'Bearer xyz';
      },
    };
    expect(authMiddelware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token', function () {
    const req = {
      get: function () {
        return 'Bearer ruiejrkwlqeioruhtj';
      },
    };

    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' }); //no change globally
    authMiddelware(req, {}, () => {});
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
