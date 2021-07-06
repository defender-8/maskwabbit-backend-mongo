const mongoose = require('mongoose');

const uri = 'mongodb+srv://AlexKondratenko:9889Livermong_RJ@cluster0.7hhqa.mongodb.net/maskwabbit?retryWrites=true&w=majority';

const mongoConnect = async (cb) => {
  try {
    await mongoose.connect(
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
    console.log('MongoDB is connected!');
    cb();
  } catch (err) {
    console.log(err);
  }
};

exports.mongoConnect = mongoConnect;
exports.mongoDbUri = uri;
