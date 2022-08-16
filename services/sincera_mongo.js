const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const { addCompany } = require('./mongo');
const trim = require('lodash/trim');

async function scrape(url, page) {
  return new Promise(async (resolve, reject) => {
    await page.goto(url).catch(err => console.log(err));
    await page.waitForTimeout(1000).catch(err => console.log(err));
    const element = await page.waitForSelector("#system-info > article > div.system-info__content > div > header > h1").catch(err => console.log(err));
    const name = await page.evaluate(element => element.textContent, element).catch(err => console.log(err));
    const publisher_coverage_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr:nth-child(3) > td:nth-child(4) > span").catch(err => console.log(err));
    let publisher_coverage = await page.evaluate(element => element.textContent, publisher_coverage_element).catch(err => console.log(err));
    if (publisher_coverage) {
      publisher_coverage = parseInt(publisher_coverage.replace(/[^\d\.\-]/g, ""));
    } else {
      publisher_coverage = 0;
    }
    const prebid_bidder_code_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > span").catch(err => console.log(err));
    const prebid_bidder_code = await page.evaluate(element => element.textContent, prebid_bidder_code_element).catch(err => console.log(err));
    const canonical_domain_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr:nth-child(5) > td:nth-child(4) > span").catch(err => console.log(err));
    const canonical_domain = await page.evaluate(element => element.textContent, canonical_domain_element).catch(err => console.log(err));
    const company_type_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr.pub-stats-table-left-col > td:nth-child(2) > span").catch(err => console.log(err));
    const company_type = await page.evaluate(element => element.textContent, company_type_element).catch(err => console.log(err));
    const location_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > span").catch(err => console.log(err));
    const location = await page.evaluate(element => element.textContent, location_element).catch(err => console.log(err));
    const tcf_vendor_id_element = await page.waitForSelector("#system-sellers > article > div > div > table > tbody > tr:nth-child(7) > td:nth-child(4) > span").catch(err => console.log(err));
    const tcf_vendor_id = await page.evaluate(element => element.textContent, tcf_vendor_id_element).catch(err => console.log(err));

    // resolve({ name, publisher_coverage: publisher_coverage ? publisher_coverage : 0, prebid_code: prebid_bidder_code, domain: canonical_domain ? canonical_domain : page, company_type: trim(company_type) });
    resolve({
      name,
      publishers: publisher_coverage ? publisher_coverage : 0,
      hb: prebid_bidder_code,
      domain: canonical_domain ? canonical_domain : page,
      type: trim(company_type),
      video: 'yes',
      endpoint: 'yes',
      location,
      tcf_vendor_id
    });
  });
}

async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  let pages = [438, 439, 31, 8, 426, 71, 159, 91, 218, 632, 33, 554, 457, 458, 17, 77, 696, 74, 92, 388, 608, 556, 51, 340, 32, 390, 612, 432, 337,
    59, 637, 263, 82, 110, 39, 131, 141, 48, 118, 138, 150, 153, 199, 213, 603, 470, 251, 261, 262, 284, 290, 266, 21, 429, 232, 628, 615, 9, 69, 420, 596, 97, 627, 6, 436,
    128, 424, 595, 464, 626, 427, 66, 633, 480, 455, 431, 437, 445, 485, 422, 461, 477, 484, 468, 469, 471, 467, 476, 488, 490, 54, 169, 446, 597, 120, 609, 113, 466, 462,
    230, 450, 631, 44, 18, 644, 606, 402, 207, 428, 60, 434, 598, 4, 623, 109, 607, 11, 57, 15, 68, 13, 440, 10, 94, 88, 158, 416, 482, 441, 545, 712, 448, 198, 56, 216, 252,
    84, 602, 154, 90];
  // pages = [277, 549, 365];
  const scrape_data = []
  let count = 0;
  for (const page_no of pages) {
    const scData = await scrape('https://app.sincera.io/systems/' + page_no, page).catch(err => console.log(err));
    scData.ref_id = page_no;
    scrape_data.push(scData);
    await addCompany(scData).catch(err => console.log(err));
    count++;
    console.log(`Completed ${pages.length}/${count} last id was: ${page_no}`);
  }
  browser.close();
  console.log('Done!!!!');
  // const json2csvParser = new Parser();
  // const csv = json2csvParser.parse(scrape_data);
  // fs.writeFileSync('companies.csv', csv);
}

start();



// let pages = [277, 549, 365, 67, 443, 605, 217, 551, 12, 552, 553, 601, 410, 206, 558, 292, 599, 76, 98, 255, 302, 386, 417, 303, 419, 105, 421, 442,
//   305, 310, 325, 328, 318, 14, 614, 616, 28, 102, 331, 129, 256, 618, 259, 621, 376, 288, 334, 344, 345, 382, 346, 625, 347, 201, 348, 387, 349, 258,
//   350, 653, 447, 1, 647, 338, 360, 361, 449, 86, 650, 53, 70, 363, 135, 38, 374, 108, 452, 351, 126, 117, 456, 352, 542, 698, 202, 451, 34, 453, 152,
//   435, 155, 541, 16, 42, 611, 591, 635, 640, 43, 112, 643, 629, 101, 24, 646, 701, 717, 78, 260, 188, 383, 396, 641, 418, 270, 89, 205, 136, 313, 157,
//   133, 179, 268, 115, 144, 145, 146, 147, 149, 100, 162, 164, 165, 166, 167, 170, 171, 173, 174, 175, 177, 178, 180, 181, 182, 184, 185, 186, 189, 190, 191,
//   192, 193, 194, 195, 196, 200, 208, 380, 96, 99, 114, 362, 254, 87, 550, 604, 624, 617, 474, 649, 151, 651, 83, 301, 563, 52, 399, 473, 652, 137, 176, 272, 183,
//   271, 273, 204, 324, 333, 282, 460, 389, 2, 274, 322, 209, 220, 211, 212, 654, 215, 223, 224, 226, 227, 228, 229, 222, 343, 278, 655, 203, 58, 45, 125, 280,
//   472, 656, 225, 281, 283, 111, 37, 327, 156, 475, 547, 694, 285, 355, 478, 465, 690, 691, 279, 692, 645, 356, 695, 359, 122, 407, 479, 487, 489, 697, 286, 648,
//   699, 219, 293, 705, 378, 703, 704, 706, 707, 708, 294, 709, 622, 713, 295, 297, 300, 404, 406, 613, 64, 700, 62, 276, 291, 298, 163, 317, 657, 710, 459, 329, 372,
//   454, 392, 27, 132, 3, 491, 714, 433, 492, 716, 718, 719, 720, 721, 722, 139, 142, 504, 323, 160, 5, 36, 253, 134, 61, 119, 357, 385, 231, 29, 393, 221, 493, 35,
//   411, 505, 548, 384, 314, 19, 463, 81, 555, 557, 401, 559, 560, 593, 600, 620, 630, 265, 289, 370, 375, 409, 413, 315, 342, 20, 494, 495, 25, 80, 610, 85, 496, 107,
//   497, 499, 500, 501, 502, 257, 503, 269, 287, 104, 377, 267, 308, 22, 538, 539, 47, 275, 319, 93, 161, 320, 543, 391, 561, 214, 638, 639, 296, 307, 316, 321, 619,
//   636, 481, 483, 486, 498, 723, 63, 546, 364, 366, 367, 394, 395, 724, 725, 726, 727, 381, 41, 299, 311, 634, 414, 540, 312, 326, 444, 332, 728, 23, 353, 46, 729, 40,
//   50, 730, 73, 7, 306, 309, 26, 49, 354, 379, 642, 368, 412, 693, 702, 715, 95, 731, 55, 335, 732, 336, 733, 30, 339, 341, 358, 369, 371, 562, 415, 400, 373, 397, 398,
//   121, 403, 405, 408, 423, 425, 430, 438, 439, 31, 8, 426, 71, 159, 91, 218, 632, 33, 554, 457, 458, 17, 77, 696, 74, 92, 388, 608, 556, 51, 340, 32, 390, 612, 432, 337,
//   59, 637, 263, 82, 110, 39, 131, 141, 48, 118, 138, 150, 153, 199, 213, 603, 470, 251, 261, 262, 284, 290, 266, 21, 429, 232, 628, 615, 9, 69, 420, 596, 97, 627, 6, 436,
//   128, 424, 595, 464, 626, 427, 66, 633, 480, 455, 431, 437, 445, 485, 422, 461, 477, 484, 468, 469, 471, 467, 476, 488, 490, 54, 169, 446, 597, 120, 609, 113, 466, 462,
//   230, 450, 631, 44, 18, 644, 606, 402, 207, 428, 60, 434, 598, 4, 623, 109, 607, 11, 57, 15, 68, 13, 440, 10, 94, 88, 158, 416, 482, 441, 545, 712, 448, 198, 56, 216, 252,
//   84, 602, 154, 90];