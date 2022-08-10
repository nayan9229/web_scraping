const { addCompany, addPublisher } = require('./mongo');
const csv = require('csvtojson');
const chunk = require('lodash/chunk');
const map = require('lodash/map');
const groupBy = require('lodash/groupBy');
const each = require('lodash/each');
const isEmpty = require('lodash/isEmpty');
const trim = require('lodash/trim');

function insertCompaniesFromCsv() {
  const file_path = '/Users/nayan/Downloads/company.csv';
  csv()
    .fromFile(file_path)
    .then(async (companies) => {
      chunk_companies = chunk(companies, 100);
      let count = 0;
      for (const companies of chunk_companies) {
        all_promise = map(companies, company => {
          return addCompany(company)
            .catch(err => {
              console.log(err);
              console.log(company);
            });
        });
        await Promise.all(all_promise).catch(err => console.log(`Promise error: ${err}`));
        count = count + 100;
        console.log(`completed count ${count}`);
      }
    });
}

function insertPublishersFromCsv() {
  const file_path = '/Users/nayan/Downloads/publishers.csv';
  csv()
    .fromFile(file_path)
    .then(async (publishers) => {
      const groups_publishers = groupBy(publishers, 'domain');
      const normalized_array = normalizedArray(groups_publishers);
      chunk_publishers = chunk(normalized_array, 100);
      let count = 0;
      for (const publishers of chunk_publishers) {
        all_promise = map(publishers, publisher => {
          return addPublisher(publisher)
            .catch(err => {
              console.log(err);
              console.log(publisher);
            });
        });
        await Promise.all(all_promise).catch(err => console.log(`Promise error: ${err}`));
        count = count + 100;
        console.log(`completed count ${count}`);
      }
    });
}

function normalizedArray(groups) {
  const final_array = [];
  each(groups, function (value, key) {
    const final_object = {
      domain: key,
      people: []
    };
    each(value, function (obj_value) {
      const user = {
        name: `${trim(obj_value.user_first_name)} ${trim(obj_value.user_last_name)}`,
        email: isEmpty(obj_value.user_email) ? undefined : trim(obj_value.user_email),
        title: isEmpty(obj_value.user_title) ? undefined : trim(obj_value.user_title),
        phone: isEmpty(obj_value.user_phone) ? undefined : trim(obj_value.user_phone),
        linkedin: isEmpty(obj_value.user_linkedin) ? undefined : trim(obj_value.user_linkedin)
      };
      final_object.name = obj_value.name;
      final_object.type = obj_value.type;
      final_object.endpoint = obj_value.endpoint;
      final_object.video = obj_value.video;
      final_object.people.push(user);
    });
    final_array.push(final_object);
  });
  return final_array;
}

