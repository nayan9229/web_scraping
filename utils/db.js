require('dotenv').config();
const initOptions = {};
const pgp = require('pg-promise')(initOptions);
const chunk = require('lodash/chunk');
const map = require('lodash/map');

const ssl = { rejectUnauthorized: false }
// Preparing the connection details:
const cn = process.env.POSTGRES_URL;
const config = {
  connectionString: cn,
  max: 30,
  ssl: ssl
};
const db = pgp(config);

async function insertCompany(companies) {
  for (const company of companies) {
    await db.query("INSERT INTO prospective_companies(${this:name}) VALUES(${this:csv})", company).catch(err => {
      console.log(err);
      console.log(company);
    });
  }
}

async function insertPublishers(publishers) {
  return new Promise(async (resolve, reject) => {
    chunk_pubs = chunk(publishers, 10000);
    let count = 0;
    for (const publishers of chunk_pubs) {
      all_promise = map(publishers, publisher => {
        return db.query('INSERT INTO prospective_publishers(${this:name}) VALUES(${this:csv}) ON CONFLICT(pub_domain, access_domain, publisher_type, prospective_company) DO NOTHING', publisher)
          .catch(err => {
            console.log(err);
            console.log(publisher);
          });
      });
      await Promise.all(all_promise).catch(err => console.log(`Promise error: ${err}`));
      count = count + 10000;
      console.log(`completed count ${count}`);
    }
    resolve(true);
  });
}

async function getCompanyIdFromRefId(ref_id) {
  return new Promise(async (resolve, reject) => {
    const company = await db.query('SELECT id FROM prospective_companies WHERE ref_id = $1 limit 1', ref_id).catch(err => console.log(err));
    resolve(company.length ? company[0].id : 0);
  });
}

module.exports = {
  insertCompany,
  insertPublishers,
  getCompanyIdFromRefId
}