const { validationResult } = require('express-validator');

const { deleteFile } = require('../utils/file');

const Product = require('../models/product');

exports.get = async (req, res, next) => {
  let { page, sorter, filters, search } = req.query;
  let { currentPage, pageSize } = page;

  currentPage = +currentPage;
  pageSize = +pageSize;

  const regExObj = { $regex: new RegExp(search), $options: 'i' };

  const conditions = {
    title: regExObj,
  };

  if (filters.categories) {
    conditions.categories = { $in: filters.categories };
  }

  try {
    const products = await Product.find(conditions)
      .sort(sorter)
      .populate('categories')
      .skip(((currentPage - 1) * pageSize))
      .limit(pageSize);

    const total = await Product.countDocuments(conditions);

    res.status(200).json({ products, total });
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
    const product = await Product.findById(id);
    res.status(200).json({ product });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.post = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { title, description, categories, price, amount } = req.body;
  const image = req.file.path;

  const product = new Product({
    title,
    image,
    description,
    categories: categories.split(','),
    price,
    amount,
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

    await product.save();
    res.status(201).json({ message: 'Product is saved!' });
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

  values.categories = values.categories.split(',');

  try {
    if (!validationErrors.isEmpty()) {
      const err = new Error('Validation failed, entered data is incorrect!');
      err.statusCode = 422;
      err.valErrArr = validationErrors.array();
      throw err;
    }

    const product = await Product.findById(id);

    if (req.file) {
      const image = req.file.path;

      deleteFile(product.image);

      values.image = image;
    }

    await product.updateOne({ ...values });

    const prodUpdated = await Product.findById(id);

    res.status(200).json({
      product: prodUpdated,
      message: 'Product is saved!',
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
    Product.findOneAndDelete(
      { _id: id },
      (err, doc) => {
        if (err) throw err;
        deleteFile(doc.image);
      },
    );
    res.status(200).json({ message: 'Product is removed' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Deleting is failed';
    }
    next(err);
  }
};
