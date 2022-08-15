const puppeteer = require('puppeteer');
const map = require('lodash/map');
const chunk = require('lodash/chunk');
const groupBy = require('lodash/groupBy');
const each = require('lodash/each');
const uniq = require('lodash/uniq');
const { addPublisher } = require('./mongo');

async function scrape(url, page) {
  return new Promise(async (resolve, reject) => {
    console.log(url);
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, { waitUntil: 'load', timeout: 0 }).catch(err => console.log(err));
    await page.waitForTimeout(1000).catch(err => console.log(err));
    let direct_pubs = await page.$$eval("#flush-collapseBOne > div > table tr", rows => {
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        return Array.from(columns, column => column.innerText);
      });
    });
    direct_pubs = map(direct_pubs, (direct_pub) => {
      return {
        rank: direct_pub[0] ? direct_pub[0] : -1,
        pub_domain: direct_pub[1] ? direct_pub[1] : '-',
        access_domain: direct_pub[2] ? direct_pub[2] : '-',
        publisher_type: 'publisher'
      }
    });
    console.log('direct_pubs', direct_pubs.length);
    let indirect_pubs = await page.$$eval("#flush-collapseBThree > div > table tr", rows => {
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        return Array.from(columns, column => column.innerText);
      });
    });
    indirect_pubs = map(indirect_pubs, (indirect_pub) => {
      return {
        rank: indirect_pub[0] ? indirect_pub[0] : -1,
        pub_domain: indirect_pub[1] ? indirect_pub[1] : '-',
        access_domain: indirect_pub[2] ? indirect_pub[2] : '-',
        publisher_type: 'publisher'
      }
    });
    console.log('indirect_pubs', indirect_pubs.length);
    resolve([...direct_pubs, ...indirect_pubs]);
  });
}

async function start() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]

  });
  const page = await browser.newPage();
  let pages = [443, 605, 217, 551, 12, 552, 553, 601, 410, 206, 558, 292, 599, 76, 98, 255, 302, 386, 417, 303, 419, 105, 421, 442,
    305, 310, 325, 328, 318, 14, 614, 616, 28, 102, 331, 129, 256, 618, 259, 621, 376, 288, 334, 344, 345, 382, 346, 625, 347, 201, 348, 387, 349, 258,
    350, 653, 447, 1, 647, 338, 360, 361, 449, 86, 650, 53, 70, 363, 135, 38, 374, 108, 452, 351, 126, 117, 456, 352, 542, 698, 202, 451, 34, 453, 152,
    435, 155, 541, 16, 42, 611, 591, 635, 640, 43, 112, 643, 629, 101, 24, 646, 701, 717, 78, 260, 188, 383, 396, 641, 418, 270, 89, 205, 136, 313, 157,
    133, 179, 268, 115, 144, 145, 146, 147, 149, 100, 162, 164, 165, 166, 167, 170, 171, 173, 174, 175, 177, 178, 180, 181, 182, 184, 185, 186, 189, 190, 191,
    192, 193, 194, 195, 196, 200, 208, 380, 96, 99, 114, 362, 254, 87, 550, 604, 624, 617, 474, 649, 151, 651, 83, 301, 563, 52, 399, 473, 652, 137, 176, 272, 183,
    271, 273, 204, 324, 333, 282, 460, 389, 2, 274, 322, 209, 220, 211, 212, 654, 215, 223, 224, 226, 227, 228, 229, 222, 343, 278, 655, 203, 58, 45, 125, 280,
    472, 656, 225, 281, 283, 111, 37, 327, 156, 475, 547, 694, 285, 355, 478, 465, 690, 691, 279, 692, 645, 356, 695, 359, 122, 407, 479, 487, 489, 697, 286, 648,
    699, 219, 293, 705, 378, 703, 704, 706, 707, 708, 294, 709, 622, 713, 295, 297, 300, 404, 406, 613, 64, 700, 62, 276, 291, 298, 163, 317, 657, 710, 459, 329, 372,
    454, 392, 27, 132, 3, 491, 714, 433, 492, 716, 718, 719, 720, 721, 722, 139, 142, 504, 323, 160, 5, 36, 253, 134, 61, 119, 357, 385, 231, 29, 393, 221, 493, 35,
    411, 505, 548, 384, 314, 19, 463, 81, 555, 557, 401, 559, 560, 593, 600, 620, 630, 265, 289, 370, 375, 409, 413, 315, 342, 20, 494, 495, 25, 80, 610, 85, 496, 107,
    497, 499, 500, 501, 502, 257, 503, 269, 287, 104, 377, 267, 308, 22, 538, 539, 47, 275, 319, 93, 161, 320, 543, 391, 561, 214, 638, 639, 296, 307, 316, 321, 619,
    636, 481, 483, 486, 498, 723, 63, 546, 364, 366, 367, 394, 395, 724, 725, 726, 727, 381, 41, 299, 311, 634, 414, 540, 312, 326, 444, 332, 728, 23, 353, 46, 729, 40,
    50, 730, 73, 7, 306, 309, 26, 49, 354, 379, 642, 368, 412, 693, 702, 715, 95, 731, 55, 335, 732, 336, 733, 30, 339, 341, 358, 369, 371, 562, 415, 400, 373, 397, 398,
    121, 403, 405, 408, 423, 425, 430, 438, 439, 31, 8, 426, 71, 159, 91, 218, 632, 33, 554, 457, 458, 17, 77, 696, 74, 92, 388, 608, 556, 51, 340, 32, 390, 612, 432, 337,
    59, 637, 263, 82, 110, 39, 131, 141, 48, 118, 138, 150, 153, 199, 213, 603, 470, 251, 261, 262, 284, 290, 266, 21, 429, 232, 628, 615, 9, 69, 420, 596, 97, 627, 6, 436,
    128, 424, 595, 464, 626, 427, 66, 633, 480, 455, 431, 437, 445, 485, 422, 461, 477, 484, 468, 469, 471, 467, 476, 488, 490, 54, 169, 446, 597, 120, 609, 113, 466, 462,
    230, 450, 631, 44, 18, 644, 606, 402, 207, 428, 60, 434, 598, 4, 623, 109, 607, 11, 57, 15, 68, 13, 440, 10, 94, 88, 158, 416, 482, 441, 545, 712, 448, 198, 56, 216, 252,
    84, 602, 154, 90];
  pages = [83, 90];
  let count = 0;
  for (const page_no of pages) {
    const start = Date.now()
    const scData = await scrape('https://app.sincera.io/systems/549/compare?competitor_id=' + page_no, page).catch(err => console.log(err));
    const groups_data = groupBy(scData, 'pub_domain');
    const normalized_data = [];
    each(groups_data, function (value, key) {
      const final_object = {
        domain: key,
        access_domains: [],
        endpoint: 'yes',
        video: 'yes',
        type: "Publisher"
      };
      each(value, function (obj_value) {
        final_object.rank = obj_value.rank;
        final_object.access_domains.push(obj_value.access_domain);
      });
      final_object.access_domains = uniq(final_object.access_domains);
      normalized_data.push(final_object);
    });

    // const fs = require('fs');
    // fs.writeFile("output.json", JSON.stringify(normalized_data), 'utf8', function (err) {
    //   if (err) {
    //     console.log("An error occured while writing JSON Object to File.");
    //     return console.log(err);
    //   }
    //   console.log("JSON file has been saved.");
    // });

    chunk_pubs = chunk(normalized_data, 10000);
    let count_sub = 0;
    for (const publishers of chunk_pubs) {
      all_promise = map(publishers, publisher => {
        return addPublisher(publisher).catch(err => console.log(err));;
      });
      await Promise.all(all_promise).catch(err => console.log(`Promise error: ${err}`));
      count_sub = count_sub + 10000;
      console.log(`completed count ${count_sub}`);
      count++;
      const stop = Date.now()
      console.log(`Completed ${pages.length}/${count} last id was: ${page_no} Time Taken to execute:${(stop - start) / 1000} seconds`);
    }
  }
  browser.close();
  console.log('Done!!!!');
}

start();