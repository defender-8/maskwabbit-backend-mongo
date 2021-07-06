const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const Client = require('../models/client');

// GET
exports.getUsers = async (req, res, next) => {
  const { page, sorter, search } = req.query;
  let { currentPage, pageSize } = page;

  currentPage = +currentPage;
  pageSize = +pageSize;

  const regExObj = { $regex: new RegExp(search), $options: 'i' };

  const conditions = {
    fullName: regExObj,
  };

  try {
    const users = await Client.find(conditions)
      .sort(sorter)
      .skip(((currentPage - 1) * pageSize))
      .limit(pageSize);

    const total = await Client.countDocuments(conditions);

    res.status(200).json({ users, total });
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

  try {
    const user = await Client.findById(id);

    if (id !== currentUserId) {
      const err = new Error('Access is not allowed!');
      err.statusCode = 403;
      throw err;
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
exports.postChangePassword = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { currentPassword, newPassword, userId } = req.body;
  const currentUserId = req.userId;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed.');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const user = await Client.findOne({ _id: userId });

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

    const user = await Client.findById(id);

    if (id !== currentUserId) {
      const err = new Error('Access is not allowed!');
      err.statusCode = 403;
      throw err;
    }

    await user.updateOne({ fullName, ...values });

    const userUpdated = await Client.findById(id);

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
    await Client.deleteOne({ _id: id });
    res.status(200).json({ message: 'User is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
