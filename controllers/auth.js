const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const Admin = require('../models/admin');
const Client = require('../models/client');

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '20cbb2ab873462',
    pass: 'a57ae4f82acf60',
  },
});

exports.signUp = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { firstName, lastName, email, password } = req.body;
  const fullName = firstName + ' ' + lastName;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed.');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const user = await Client.findOne({ email });
    if (user) {
      const err = new Error('A user with this email is already exist. Please, sign in');
      err.statusCode = 409;
      throw err;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const newUser = new Client({
      firstName, lastName, fullName, email, password: hashedPw, role: 'client',
    });
    await newUser.save();

    const token = jwt.sign(
      {
        _id: newUser._id.toString(),
        role: newUser.role,
      },
      'somesupersecret',
      { expiresIn: '365d' },
    );

    res.status(201).json({
      user: {
        token,
        _id: newUser._id.toString(),
        role: newUser.role,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.fullName,
      },
      message: 'You are successfully signed up!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signIn = (model) => {
  return async (req, res, next) => {
    const validationErrors = validationResult(req);
    const { email, password } = req.body;

    try {
      if (!validationErrors.isEmpty()) {
        const err = new Error('Validation failed.');
        err.statusCode = 422;
        err.valErrArr = validationErrors.array();
        throw err;
      }

      const user = await model.findOne({ email });

      if (!user) {
        const err = new Error('No account with that email found!');
        err.statusCode = 401;
        throw err;
      }

      const isPwEqual = await bcrypt.compare(password, user.password);

      if (!isPwEqual) {
        const err = new Error('Wrong password!');
        err.statusCode = 401;
        throw err;
      }

      const token = jwt.sign(
        {
          _id: user._id.toString(),
          role: user.role,
        },
        'somesupersecret',
        { expiresIn: '365d' },
      );

      const expiryDate = Date.now() + 3600000;

      res.status(200).json({
        token,
        expiryDate,
        _id: user._id.toString(),
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
};

exports.resetPassword = (model) => {
  return async (req, res, next) => {
    const validationErrors = validationResult(req);
    const email = req.body.email;

    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        err.statusCode = 500;
        next(err);
      }

      const token = buffer.toString('hex');

      try {
        if (!validationErrors.isEmpty()) {
          const err = new Error('Validation failed.');
          err.statusCode = 422;
          err.valErrArr = validationErrors.array();
          throw err;
        }

        const user = await model.findOne({ email });

        if (!user) {
          const err = new Error('No account with that email found!');
          err.statusCode = 401;
          throw err;
        }

        Object.assign(user, {
          resetToken: token,
          resetTokenExpiration: Date.now() + 3600000,
        });
        await user.save();

        res.status(200).json({
          message: 'The instruction is sent',
          userId: user._id,
        });

        transporter.sendMail({
          from: 'shop@test.com',
          to: email,
          subject: 'Password reset',
          html: `
          <p>You requested a password reset.</p>
          <p>Click this <a href="http://localhost:3000/auth/password-reset/${token}">link</a> to set a new password.</p>
        `,
        }, (err, info) => {
          if (err) {
            err.statusCode = 500;
            next(err);
          } else {
            console.log(info);
          }
        });

      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
    });
  };
};

exports.changePassword = (model) => {
  return async (req, res, next) => {
    const validationErrors = validationResult(req);
    const { password, userId } = req.body;
    const resetToken = req.params.token;

    try {
      if (!validationErrors.isEmpty()) {
        const err = new Error('Validation failed.');
        err.statusCode = 422;
        err.valErrArr = validationErrors.array();
        throw err;
      }

      const user = await model.findOne({
        resetToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
      });

      if (!user) {
        const err = new Error('Try reset password again');
        err.statusCode = 401;
        throw err;
      }


      const newPassword = await bcrypt.hash(password, 12);

      Object.assign(user, {
        password: newPassword,
        resetToken: null,
        resetTokenExpiration: null,
      });
      await user.save();

      res.status(200).json({ message: 'Password is changed! Please, sign in' });

    } catch (err) {
      next(err);
    }
  };
};

