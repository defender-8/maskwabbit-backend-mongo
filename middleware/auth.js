const jwt = require('jsonwebtoken');

const Admin = require('../models/admin');

exports.isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const err = new Error('Not authenticated!');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const err = new Error('Not authenticated!');
    err.statusCode = 401;
    throw err;
  }

  req.userId = decodedToken._id;
  req.userRole = decodedToken.role;
  next();
};

exports.isSuperAdmin = (req, res, next) => {
  const userRole = req.userRole;

  if (userRole !== 'super admin') {
    const err = new Error('Access is not allowed!');
    err.statusCode = 403;
    throw err;
  }

  next();
};

exports.isAdmin = (req, res, next) => {
  const userRole = req.userRole;

  if ((userRole !== 'super admin') && (userRole !== 'admin')) {
    const err = new Error('Access is not allowed!');
    err.statusCode = 403;
    throw err;
  }

  next();
};
