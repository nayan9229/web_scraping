require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const DbConnection = function () {

  let db = null;
  let instance = 0;

  async function DbConnect() {
    try {
      let url = process.env.MONGO_URL;
      let _db = await MongoClient.connect(url);

      return _db
    } catch (e) {
      return e;
    }
  }

  async function Get() {
    try {
      instance++;     // this is just to count how many times our singleton is called.
      // console.log(`DbConnection called ${instance} times`);

      if (db != null) {
        // console.log(`db connection is already alive`);
        return db;
      } else {
        // console.log(`getting new db connection`);
        db = DbConnect();
        return db;
      }
    } catch (e) {
      return e;
    }
  }

  return {
    Get: Get
  }
}

module.exports = DbConnection();
