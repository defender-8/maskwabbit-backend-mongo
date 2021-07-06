const { validationResult } = require('express-validator');

const { deleteFile } = require('../utils/file');

const Product = require('../models/product');
const ProductCategory = require('../models/product-category');

// GET
exports.getProducts = async (req, res, next) => {
  // console.log('>>>>>>>> req.query:\n', req.query);
  let { page, sorter, filters, search } = req.query;
  let { currentPage, pageSize } = page;

  currentPage = +currentPage;
  pageSize = +pageSize;

  const regExObj = { $regex: new RegExp(search), $options: 'i' };

  const conditions = {
    title: regExObj,
  };

  try {
    const prodCats = await ProductCategory.find().select('title _id');

    const prodCatsLight = prodCats.map(pc => [pc.title, pc._id]);

    if (filters.productCategory) {
      const pcFilter = filters.productCategory.map(pc => {
        const catId = prodCatsLight.find(pcl => pcl[0] === pc)[1];
        return catId;
      });

      conditions.productCategory = pcFilter;
    }

    const products = await Product.find(conditions)
      .sort(sorter)
      .populate('productCategory', 'title')
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

exports.getProduct = async (req, res, next) => {
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

// POST
exports.postProduct = async (req, res, next) => {
  const validationErrors = validationResult(req);
  const { title, description, productCategory, price, amount } = req.body;
  const image = req.file.path;

  const product = new Product({
    title,
    image,
    description,
    productCategory,
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

// PUT
exports.putProduct = async (req, res, next) => {
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

// DELETE
exports.deleteProduct = async (req, res, next) => {
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
