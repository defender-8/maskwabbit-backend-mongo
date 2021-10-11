const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const Admin = require('../models/admin');

exports.get = async (req, res, next) => {
  const { role, page, sorter, search } = req.query;
  let { currentPage, pageSize } = page;

  currentPage = +currentPage;
  pageSize = +pageSize;

  const regExObj = { $regex: new RegExp(search), $options: 'i' };

  const conditions = {
    role,
    fullName: regExObj,
  };

  try {
    const dataArray = await Admin.find(conditions)
      .sort(sorter)
      .skip(((currentPage - 1) * pageSize))
      .limit(pageSize);

    const total = await Admin.countDocuments(conditions);

    res.status(200).json({ dataArray, total });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  const id = req.params.id;
  const currentUserId = req.userId;
  const currentUserRole = req.userRole;

  try {
    const dataSingle = await Admin.findById(id);

    if (dataSingle.role === 'super admin') {
      if (id !== currentUserId) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }
    if (dataSingle.role === 'admin') {
      if ((id !== currentUserId) && (currentUserRole !== 'super admin')) {
        const err = new Error('Access is not allowed!');
        err.statusCode = 403;
        throw err;
      }
    }

    res.status(200).json({ dataSingle });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.post = async (req, res, next) => {
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

    const user = await Admin.findOne({ email });
    if (user) {
      const err = new Error('A user with this email is already exist');
      err.statusCode = 409;
      throw err;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const newUser = new Admin({
      firstName, lastName, fullName, email, password: hashedPw, role,
    });

    await newUser.save();

    res.status(201).json({ message: 'User is saved!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.put = async (req, res, next) => {
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

    const user = await Admin.findById(id);

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

    const userUpdated = await Admin.findById(id);

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

exports.changePassword = async (req, res, next) => {
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

    const user = await Admin.findOne({ _id: userId });

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

exports.delete = async (req, res, next) => {
  const id = req.params.id;

  try {
    await Admin.deleteOne({ _id: id });
    res.status(200).json({ message: 'User is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
