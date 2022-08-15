const client = require('../utils/mongo_db');

const DB_NAME = 'infytv';
const DB_TABLE_COMPANY = 'company';
const DB_TABLE_PUBLISHER = 'publisher';

async function getDB() {
  let db = await client.Get();
  db = db.db(DB_NAME);
  // console.log('Connected successfully!!!');
  return db;
}

function addCompany(company) {
  return new Promise(async (resolve, reject) => {
    const db = await getDB();
    const query = { domain: company.domain };
    const update = { $set: company };
    const options = { upsert: true };
    db.collection(DB_TABLE_COMPANY).updateOne(query, update, options, (err, res) => {
      if (err) {
        reject({ message: err })
      } else {
        resolve(res);
      }
    });
    //   db.collection.bulkWrite( [
    //     { updateOne :
    //        {
    //           "filter" : <document>,
    //           "update" : <document>,
    //           "upsert" : <boolean>,
    //           "collation": <document>,
    //           "arrayFilters": [ <filterdocument1>, ... ]
    //        }
    //     }
    //  ] )
  });
}

function addPublisher(publisher) {
  return new Promise(async (resolve, reject) => {
    const db = await getDB();
    const query = { domain: publisher.domain };
    const update = { $setOnInsert: publisher };
    const options = { upsert: true };
    db.collection(DB_TABLE_PUBLISHER).updateOne(query, update, options, (err, res) => {
      if (err) {
        reject({ message: err })
      } else {
        resolve(res);
      }
    });
  });
}

async function createUniqueIndexOfCompany() {
  const db = await getDB();
  const is_created = await db.collection(DB_TABLE_COMPANY).createIndex({ "domain": 1 }, { unique: true }).catch(err => console.log(err));
  console.log(is_created);
}

async function createUniqueIndexOfPublisher() {
  const db = await getDB();
  const is_created = await db.collection(DB_TABLE_PUBLISHER).createIndex({ "domain": 1 }, { unique: true }).catch(err => console.log(err));
  console.log(is_created);
}

async function createUniqueIndexOfCompanyUserEmail() {
  const db = await getDB();
  const is_created = await db.collection(DB_TABLE_COMPANY).createIndex({ "persons.email": 1 }, { unique: true }).catch(err => console.log(err));
  console.log(is_created);
}

async function createUniqueIndexOfPublisherUserEmail() {
  const db = await getDB();
  const is_created = await db.collection(DB_TABLE_PUBLISHER).createIndex({ "persons.email": 1 }, { unique: true }).catch(err => console.log(err));
  console.log(is_created);
}

module.exports = {
  addCompany,
  addPublisher
}

// createUniqueIndexOfCompany();
// createUniqueIndexOfPublisher();
// createUniqueIndexOfCompanyUserEmail();
// createUniqueIndexOfPublisherUserEmail();