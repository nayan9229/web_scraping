// const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'me',
//   host: 'localhost',
//   database: 'api',
//   password: 'password',
//   port: 5432,
// })


const initOptions = {};
const pgp = require('pg-promise')(initOptions);

const ssl = { rejectUnauthorized: false }
// Preparing the connection details:
const cn = '';
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
    for (const publisher of publishers) {
      await db.query('INSERT INTO prospective_publishers(${this:name}) VALUES(${this:csv}) ON CONFLICT(pub_domain, access_domain, publisher_type, prospective_company) DO NOTHING', publisher)
        .catch(err => {
          console.log(err);
          console.log(publisher);
        });
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