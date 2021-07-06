const fs = require('fs');
const path = require('path');

exports.clearDir = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(dir, file), err => {
        if (err) throw err;
      });
    }
  });
}

exports.createDirIfNotExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

exports.deleteFile = filePath => {
  fs.unlink(filePath, err => {
    if (err) {
      throw (err);
    }
  });
};
