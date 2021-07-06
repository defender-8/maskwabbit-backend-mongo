const { clearDir, createDirIfNotExist } = require('../utils/file');
const multer = require('multer');

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
  ];

  if (allowedMimeTypes.indexOf(file.mimetype) > -1) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const limits = {
  fileSize: 1024 * 1024,
};

// tempImageUpload
let destFolder;
const tempImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    destFolder = 'public/img/temp/' + req.userId;
    createDirIfNotExist(destFolder);
    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    clearDir(destFolder);
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

exports.tempImageUpload = multer({ storage: tempImageStorage, fileFilter: imageFilter, limits });


// imageUpload
const imageStorage = (dir) => {
  return (
    multer.diskStorage({
      destination: (req, file, cb) => {
        if (file) {
          cb(null, 'public/img/' + dir);
        }
        return null;
      },
      filename: (req, file, cb) => {
        if (file) {
          cb(null, new Date().toISOString() + '-' + file.originalname);
        }
        return null;
      },
    })
  );
};

exports.imageUpload = (dir) => multer({
  storage: imageStorage(dir),
  fileFilter: imageFilter,
  limits,
});
