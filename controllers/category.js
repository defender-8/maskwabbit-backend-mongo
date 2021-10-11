const { validationResult } = require('express-validator');

const { deleteFile } = require('../utils/file');

const Category = require('../models/category');

exports.get = async (req, res, next) => {
  try {
    if (Object.keys(req.query).length !== 0) {
      const { page, sorter, search } = req.query;
      let { currentPage, pageSize } = page;

      currentPage = +currentPage;
      pageSize = +pageSize;

      const regExObj = { $regex: new RegExp(search), $options: 'i' };

      const conditions = {
        title: regExObj,
      };

      const dataArray = await Category.find(conditions)
        .sort(sorter)
        .skip(((currentPage - 1) * pageSize))
        .limit(pageSize);

      const total = await Category.countDocuments(conditions);

      res.status(200).json({ dataArray, total });
    } else {
      const dataArray = await Category.find();
      res.status(200).json({ dataArray });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const dataSingle = await Category.findById(id);
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
  const { title, description } = req.body;
  const image = req.file.path;

  const category = new Category({
    title,
    description,
    image,
    createdBy: req.userId,
  });

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    if (!req.file) {
      const err = new Error('No image provided!');
      err.statusCode = 422;
      throw err;
    }

    await category.save();
    res.status(201).json({ message: 'Product category is saved!' });
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
  const { ...values } = req.body;

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const category = await Category.findById(id);

    if (req.file) {
      const image = req.file.path;

      deleteFile(category.image);

      values.image = image;
    }

    await category.updateOne({ ...values });

    const categoryUpdated = await Category.findById(id);

    res.status(200).json({
      category: categoryUpdated,
      message: 'Product category is saved!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;

  try {
    Category.findOneAndDelete(
      { _id: id },
      (err, doc) => {
        if (err) throw err;
        deleteFile(doc.image);
      },
    );

    res.status(200).json({ message: 'Product category is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
