/**
 * This script utilizes Puppeteer to scrape listings from Carousell.sg for a given search query.
 * It sets up a headless browser, navigates to the website, performs a search, and extracts listing data.
 */

import puppeteer from "puppeteer";

(async () => {
	// Launch a headless browser instance
	const browser = await puppeteer.launch({
		defaultViewport: null,
	});

	// Create a new page within the browser instance
	const page = await browser.newPage();

	// Set user agent to simulate a specific browser environment
	// oddly without this, it will not function headlessly
	await page.setUserAgent(
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
	);

	// Set the viewport size
	// Without this, the search button or other elements will not exist
	await page.setViewport({
		width: 1920,
		height: 1080,
		deviceScaleFactor: 1,
	});

	// Navigate to Carousell.sg homepage
	await page.goto("https://www.carousell.sg", {
		waitUntil: "domcontentloaded",
	});

	// Wait for the search input field and submit button to be available
	await page.waitForSelector(
		'input[placeholder="Search for anything and everything"]'
	);
	await page.waitForSelector('button[type="submit"]');

	// Type the search query and submit the search form
	await page.type(
		"input[placeholder='Search for anything and everything']",
		"rtx 4060"
	);
	await page.click('button[type="submit"]');

	// Wait for the navigation to complete
	await page.waitForNavigation({
		waitUntil: "networkidle0",
	});

	// Extract listing data from the page
	const listings = await page.evaluate(() => {
		// Select all listing cards
		const listingsArr = document.querySelectorAll(
			'div[data-testid^="listing-card-"]'
		);
		// Map each listing card to extract relevant information
		return Array.from(listingsArr).map((listing) => {
			const title = listing.querySelector(
				'p[style="--max-line: 2;"]'
			).innerHTML;
			const price = listing.querySelector('p[title^="S$"]').innerHTML;
			const link = `https://www.carousell.sg${listing.querySelector('a[href^="/p/"]').getAttribute("href")}`;
			// const imgUrl = listing.querySelector('img').src

			// Get current date in the format dd/mm/yyyy
			const today = new Date();
			let date = today.getDate();
			let month = today.getMonth();
			const year = today.getFullYear();
			if (date < 10) date = `0${date}`;
			if (month < 10) month = `0${month}`;

			return { title, price, link, date: `${date}/${month}/${year}` };
		});
	});

	//TODO: can maybe filter out prices that are above $1,000 so that only GPUs are shown
	//TODO: have this function return to another file that will take it and input it to google sheets 

	// Output the extracted listings to the console
	console.log(listings);

	// Close the browser instance
	await browser.close();
})();
