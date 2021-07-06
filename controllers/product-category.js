const { validationResult } = require('express-validator');

const { deleteFile } = require('../utils/file');

const Product = require('../models/product');
const ProductCategory = require('../models/product-category');

// GET
exports.getProdCats = async (req, res, next) => {
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

      const prodCats = await ProductCategory.find(conditions)
        .sort(sorter)
        .skip(((currentPage - 1) * pageSize))
        .limit(pageSize);

      const total = await ProductCategory.countDocuments(conditions);

      res.status(200).json({ prodCats, total });
    } else {
      const prodCats = await ProductCategory.find();
      res.status(200).json({ prodCats });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProdCat = async (req, res, next) => {
  const id = req.params.id;

  try {
    const prodCat = await ProductCategory.findById(id);
    res.status(200).json({ prodCat });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST
exports.postProdCat = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { title, description } = req.body;
  const image = req.file.path;

  const prodCat = new ProductCategory({
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

    await prodCat.save();
    res.status(201).json({ message: 'Product category is saved!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// PUT
exports.putProdCat = async (req, res, next) => {
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

    const prodCat = await ProductCategory.findById(id);

    if (req.file) {
      const image = req.file.path;

      deleteFile(prodCat.image);

      values.image = image;
    }

    await prodCat.updateOne({ ...values });

    const prodCatUpdated = await ProductCategory.findById(id);

    res.status(200).json({
      prodCat: prodCatUpdated,
      message: 'Product category is saved!',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// DELETE
exports.deleteProdCat = async (req, res, next) => {
  const id = req.params.id;

  try {
    // Check UI/UX if response is too long for some reason
    /*const a = await new Promise((resolve, reject) => {
      setTimeout(() => resolve('done'), 3000);
    });*/

    ProductCategory.findOneAndDelete(
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
