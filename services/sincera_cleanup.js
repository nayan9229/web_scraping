const { getPublishers, addPublisherWithoutUpdate } = require('./mongo');
const each = require('lodash/each');
const chunk = require('lodash/chunk');
const map = require('lodash/map');
const range = require('lodash/range');

async function start() {
  const pages = range(50);
  const start = Date.now();
  for (const page of pages) {
    const publishers = await getPublishers(page, 1000, { "access_domains": { $ne: null } });
    const access_domains = [];
    for (const publisher of publishers) {
      each(publisher.access_domains, acd => {
        access_domains.push({
          domain: acd,
          type: 'Access Publisher'
        })
      });
    }
    chunk_pubs = chunk(access_domains, 10000);
    let count_sub = 0;
    for (const publishers of chunk_pubs) {
      const all_promise = map(publishers, publisher => {
        return addPublisherWithoutUpdate(publisher).catch(err => console.log(err));;
      });
      await Promise.all(all_promise).catch(err => console.log(`Promise error: ${err}`));
      count_sub = count_sub + 10000;
      console.log(`completed count ${count_sub}`);
    }
    const stop = Date.now()
    console.log(`Completed ${pages.length}/${page} last page was: ${page} Time Taken to execute:${(stop - start) / 1000} seconds`);
  }
  console.log('Done!');
}

start();