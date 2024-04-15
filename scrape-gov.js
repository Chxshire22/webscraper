import puppeteer from "puppeteer";

(
	async ()=>{
		const browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
		});
	const page = await browser.newPage();
		await page.goto("https://www.enterprisesg.gov.sg/financial-support/enterprise-development-grant",{
			waitUntil:"networkidle2"
		})

		// const applyBtn = await page.$("")
	}
)()
