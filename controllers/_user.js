const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/_user');

// GET
exports.getSuperAdmins = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'super admin' });
    res.status(200).json({ users });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAdmins = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'admin' });
    res.status(200).json({ users });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getClients = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'client' });
    res.status(200).json({ users });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  const id = req.params.id;
  const currentUserId = req.userId;
  const currentUserRole = req.userRole;

  try {
    const user = await User.findById(id);

    if (user.role === 'super admin') {
      if (id !== currentUserId) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }
    if (user.role === 'admin') {
      if ((id !== currentUserId) && (currentUserRole !== 'super admin')) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }

    if (user.role === 'client') {
      if (id !== currentUserId) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }

    res.status(200).json({ user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST
exports.postUser = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { firstName, lastName, email, password, role } = req.body;
  const fullName = firstName + ' ' + lastName;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed.');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const user = await User.findOne({ email });
    if (user) {
      const err = new Error('A user with this email is already exist');
      err.statusCode = 409;
      throw err;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName, lastName, fullName, email, password: hashedPw, role,
    });
    const result = await newUser.save();

    res.status(201).json({ message: 'User is saved!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postChangePassword = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { currentPassword, newPassword, userId } = req.body;
  const currentUserId = req.userId;

  try {
    if (!validationErrors.isEmpty()) {
      console.log('!!!!! validationErrors.array():\n', validationErrors.array());
      const err = new Error('Validation failed.');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const user = await User.findOne({ _id: userId });

    console.log(userId, currentUserId);

    if (!user) {
      const err = new Error('The user is not found');
      err.statusCode = 401;
      throw err;
    }

    if ((userId !== currentUserId)) {
      const err = new Error('Access is not allowed!');
      err.statusCode = 403;
      throw err;
    }

    const isPwEqual = await bcrypt.compare(currentPassword, user.password);
    if (!isPwEqual) {
      const err = new Error('Wrong current password!');
      err.statusCode = 401;
      throw err;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password is changed' });

  } catch (err) {
    next(err);
  }
};

// PUT
exports.putUser = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const id = req.params.id;
  const currentUserId = req.userId;
  const currentUserRole = req.userRole;
  const { ...values } = req.body;
  const { firstName, lastName } = { ...values };
  const fullName = firstName + ' ' + lastName;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const user = await User.findById(id);

    if (user.role === 'super admin') {
      if (id !== currentUserId) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }
    if (user.role === 'admin') {
      if ((id !== currentUserId) && (currentUserRole !== 'super admin')) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }

    await user.updateOne({ fullName, ...values });
    const userUpdated = await User.findById(id);
    res.status(200).json({
      user: userUpdated,
      message: 'User is saved!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// DELETE
exports.deleteUser = async (req, res, next) => {
  const id = req.params.id;

  try {
    await User.deleteOne({ _id: id });
    res.status(200).json({ message: 'User is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
