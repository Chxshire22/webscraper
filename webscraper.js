/**
 * This script utilizes Puppeteer to scrape listings from Carousell.sg for a given search query.
 * It sets up a headless browser, navigates to the website, performs a search, and extracts listing data.
 */

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

puppeteer.use(StealthPlugin());

const USERAGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const VIEWPORT = {
  width: 1440,
  height: 1080,
  deviceScaleFactor: 1,
};

const scrape = async (searchTerm, lowLimit, highLimit) => {
  let results = {};

  // Launch a headless browser instance
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    executablePath: executablePath(),
  });
  // Create a new page within the browser instance
  const carousellPage = await browser.newPage();
  // Set user agent to simulate a specific browser environment
  // oddly without this, it will not function headlessly
  await carousellPage.setUserAgent(USERAGENT);
  // Set the viewport size
  // Without this, the search button or other elements will not exist
  await carousellPage.setViewport(VIEWPORT);
  // Navigate to Carousell.sg homepage
  await carousellPage.goto("https://www.carousell.sg", {
    waitUntil: "domcontentloaded",
  });
  // Wait for the search input field and submit button to be available
  await carousellPage.waitForSelector(
    'input[placeholder="Search for anything and everything"]'
  );
  await carousellPage.waitForSelector('button[type="submit"]');
  // Type the search query and submit the search form
  await carousellPage.type(
    "input[placeholder='Search for anything and everything']",
    searchTerm
  );
  await carousellPage.click('button[type="submit"]');
  // Wait for the navigation to complete
  await carousellPage.waitForNavigation({
    waitUntil: "networkidle0",
  });
  // Extract listing data from the page
  results.carousell = await carousellPage.evaluate(() => {
    try {
      // Select all listing cards
      const listingsArr = document.querySelectorAll(
        'div[data-testid^="listing-card-"]'
      );
      const slicedArr = Array.from(listingsArr).slice(0, 10);
      // Map each listing card to extract relevant information
      return Array.from(slicedArr).map((listing) => {
        const title = listing.querySelector(
          'p[style="--max-line: 2;"]'
        ).innerHTML;
        const unformattedPrice =
          listing.querySelector('p[title^="S$"]').innerHTML;
        const price = unformattedPrice.replace("S$", "").replace(",", "");
        const link = `https://www.carousell.sg${listing
          .querySelector('a[href^="/p/"]')
          .getAttribute("href")}`;
        // const imgSrc = listing
        //   .querySelector(`img[alt="${title}"]`)
        //   .getAttribute("src");

        return { title, price, link};
      });
      // .sort((a, b) => a.price - b.price)
    } catch (error) {
      console.log(error);
    }
  });

  const ebayPage = await browser.newPage();
  await ebayPage.setUserAgent(USERAGENT);
  await ebayPage.setViewport(VIEWPORT);
  await ebayPage.goto("https://www.ebay.com.sg/", {
    waitUntil: "networkidle2",
  });
  await ebayPage.waitForSelector(
    'input[type="text"][placeholder="Search for anything"]'
  );
  await ebayPage.waitForSelector("input[type='submit'][value='Search']");
  await ebayPage.type(
    'input[type="text"][placeholder="Search for anything"]',
    searchTerm
  );
  await ebayPage.click("input[type='submit'][value='Search']");
  await ebayPage.waitForNavigation({
    // timeout: 0,
    waitUntil: "networkidle0",
  });

  results.ebay = await ebayPage.evaluate(() => {
    try {
      // Select all listing cards
      const listingsArr = document.querySelectorAll("li.s-item");
      const listingsWithoutFirstItem = Array.from(listingsArr).slice(1, 11);

      // Map each listing card to extract relevant information
      return Array.from(listingsWithoutFirstItem).map((listing) => {
        const title = listing.querySelector('span[role="heading"]').innerText;
        const unformattedPrice = listing.querySelector(
          '.s-item__price>span[class="ITALIC"]'
        ).innerText;
        const price = unformattedPrice.replace("S$", "").replace(",", "");
        const link = listing
          .querySelector("a.s-item__link")
          .getAttribute("href");
        // const imgSrc = listing.querySelector('img[src^="https://i.ebayimg.com/thumbs/images/"]').getAttribute("src");

        return { title, price, link };
      });
      // .sort((a, b) => a.price - b.price)
    } catch (error) {
      console.log(error);
    }
  });

  // Close the browser instance
  await browser.close();
  return results;
};

module.exports = scrape;

// better off using a loop or recursion.
