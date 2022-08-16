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
  });
}

function addPublisher(publisher) {
  return new Promise(async (resolve, reject) => {
    const db = await getDB();
    const query = { domain: publisher.domain };
    const update = { $set: publisher };
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

function addPublisherWithoutUpdate(publisher) {
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

async function getPublishers(page, perPage, filter = {}) {
  const db = await getDB();
  const publishers = [];
  await db.collection(DB_TABLE_PUBLISHER)
    .find(filter)
    .skip(perPage * page)
    .limit(perPage)
    .forEach(publisher => publishers.push(publisher));
  return publishers;
}

module.exports = {
  addCompany,
  addPublisher,
  addPublisherWithoutUpdate,
  getPublishers
}

// createUniqueIndexOfCompany();
// createUniqueIndexOfPublisher();
// createUniqueIndexOfCompanyUserEmail();
// createUniqueIndexOfPublisherUserEmail();
// getPublishers(0, 10, { "access_domains": { $ne: null } }).then(data => console.log('data', data)).catch(err => console.log(err));
