const { MongoClient } = require('mongodb');
const state = { db: null };

module.exports.connect = function (done) {
  const url = 'mongodb://localhost:27017';
  const dbname = 'internportal';

  MongoClient.connect(url)
    .then(client => {
      state.db = client.db(dbname);
      done();
    })
    .catch(err => done(err));
};

module.exports.get = function () {
  return state.db;
};
