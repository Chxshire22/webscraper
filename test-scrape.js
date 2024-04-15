const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');

puppeteer.use(StealthPlugin())

(
	async ()=>{
		const browser = await puppeteerExtra.launch({
			headless: false,
			defaultViewport: null,
			executablePath: executablePath()
		});
	const page = await browser.newPage();
		await page.goto("https://bot.sannysoft.com/",{
			waitUntil:"networkidle2"
		})

	}
)()
